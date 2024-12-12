// ==UserScript==
// @name         Reddit Left Sidebar Toggle
// @namespace    http://tampermonkey.net/
// @version      0.3.2
// @description  Toggle the left sidebar on Reddit [ON|OFF] / persistent state
// @author       /u/x647
// @match        *://www.reddit.com/*
// @match        *://sh.reddit.com/*
// @exclude      *://old.reddit.com/*
// @exclude      *://new.reddit.com/*
// @exclude      *://i.reddit.com/*
// @exclude      *://www.reddit.com/mod/*
// @exclude      *://sh.reddit.com/mod/*
// @exclude      *://www.reddit.com/prefs/*
// @exclude      *://www.reddit.com/account-activity
// @exclude      *://www.reddit.com/live/*
// @exclude      *://www.reddit.com/dev/*.
// @exclude      *://www|sh.reddit.com/media?url=*
// @icon         https://static.thenounproject.com/png/3095005-200.png
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    const SIDEBAR_SELECTORS = [
        'div#left-sidebar',
        '.nd\\:visible.block.w-full.sticky.top-\\[56px\\].h-screen-without-header.styled-scrollbars.overflow-y-scroll.overflow-x-hidden.bg-neutral-background.box-border.px-md',
        'div#left-sidebar-container',
        '.left-sidebar.theme-rpl.isolate.order-first.hidden.m\\:block.border-0.border-solid.s\\:border-r-sm.border-r-neutral-border',
        '.z-\\[2\\].box-border.flex.flex-col.mt-0.mb-0.pt-md.shrink-0.s\\:shrink.w-full.min-h-screen-without-header.select-none'
    ];

    const CONTENT_SELECTOR = [
        '.subgrid-container',
        '#main-content'
    ];

    const TOGGLE_CLASS = 'sidebar-hidden';
    let observerInitialized = false;

    GM_addStyle(`
        .toggle-container {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
            margin-left: 10px;
            vertical-align: middle;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: #FF4500;
        }

        input:checked + .slider:before {
            transform: translateX(20px);
        }

        .centered-toggle {
            position: absolute;
            top: 50%;
            left: 12%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
        }

        .toggle-label {
            margin-left: 10px;
            font-size: 14px;
            color: #333;
            cursor: pointer;
        }

        /* Override styles for content expansion */
        .expanded-content {
            margin-left: 0 !important;
            max-width: calc(100% + 0px)!important;
            width: calc(1120px + 150px) !important; /* Adjust expansion */
            transition: width 0.2s ease-in-out, margin-left 0.2s ease-in-out;
        }
    `);

    function createToggleSlider() {
        const existingToggle = document.querySelector('.toggle-container');
        if (existingToggle) return;

        const toggleContainer = document.createElement('label');
        toggleContainer.className = 'toggle-container';

        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';

        const slider = document.createElement('span');
        slider.className = 'slider';

        const label = document.createElement('span');
        label.className = 'toggle-label';
        label.textContent = 'Sidebar Toggle';

        toggleContainer.appendChild(toggleInput);
        toggleContainer.appendChild(slider);

        const centeredWrapper = document.createElement('div');
        centeredWrapper.className = 'centered-toggle';
        centeredWrapper.appendChild(toggleContainer);
        centeredWrapper.appendChild(label);

        const targetContainer = document.querySelector('.items-center.flex.h-header-large');
        if (targetContainer) {
            targetContainer.appendChild(centeredWrapper);
        }

        toggleInput.addEventListener('change', () => {
            if (toggleInput.checked) {
                showSidebar();
                localStorage.setItem(TOGGLE_CLASS, 'false');
            } else {
                hideSidebar();
                localStorage.setItem(TOGGLE_CLASS, 'true');
            }
        });

        if (localStorage.getItem(TOGGLE_CLASS) === 'true') {
            toggleInput.checked = false;
            hideSidebar();
        } else {
            toggleInput.checked = true;
            showSidebar();
        }

        label.addEventListener('click', () => {
            toggleInput.checked = !toggleInput.checked;
            toggleInput.dispatchEvent(new Event('change'));
        });
    }

    function hideSidebar() {
        SIDEBAR_SELECTORS.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.transform = 'translateX(-4000px)';
                element.style.transition = 'transform 0.2s ease-in-out';
            });
        });

        CONTENT_SELECTOR.forEach(selector => {
            const contentElements = document.querySelectorAll(selector);
            contentElements.forEach(element => {
                element.classList.add('expanded-content');
            });
        });
    }

    function showSidebar() {
        SIDEBAR_SELECTORS.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.transform = '';
                element.style.transition = 'transform 0.4s ease-in-out';
            });
        });

        CONTENT_SELECTOR.forEach(selector => {
            const contentElements = document.querySelectorAll(selector);
            contentElements.forEach(element => {
                element.classList.remove('expanded-content');
            });
        });
    }

    function init() {
        createToggleSlider();

        if (observerInitialized) return;

        const observer = new MutationObserver(() => {
            if (document.querySelector('.items-center.flex.h-header-large')) {
                createToggleSlider();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        observerInitialized = true;

        window.addEventListener('load', () => {
            createToggleSlider();
        });
    }

    init();
})();
