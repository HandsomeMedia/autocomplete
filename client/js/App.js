/* eslint "require-jsdoc": 0*/

'use strict';

import appStyles from '../sass/app.scss';
import xhrReq from './xhr.js';

const autocomplete = {
	fs: document.createElement('fieldset'),
	input: document.createElement('input'),
	init(placeholder, api) {
		let userStr; // hold ref to original user string
		const ul = document.createElement('ul');
		const resetBtn = document.createElement('button');

		const onKey = (e) => {
			switch (e.keyCode) {
				case 40: // Arrow Down
					selectItem(1);
					break;
				case 38: // Arrow Up
					e.preventDefault(); // stop cursor from moving to line-start
					selectItem(-1);
					break;
				case 27: // Escape
					this.input.value = userStr;
				case 13: // Enter
					this.hideList(true);
					break;
			}
		};

		const onInput = (e) => {
			userStr = this.input.value;

			if (this.input.value.length < 2) {
				this.hideList(true);
				return;
			}

			const render = (obj) => {
				ul.index = -1;
				while (ul.lastChild) {
					ul.lastChild.remove();
				}

				if (obj.count) {
					this.hideList(false);
				} else {
					this.hideList(true); // no items were returned
					return;
				}

				obj.data.forEach((item) => {
					const li = document.createElement('li');
					li.textContent = item.name;
					ul.appendChild(li);
				});
			};

			xhrReq('GET', `${api}?term=${this.input.value}`).then(
				(obj) => render(obj), (err) => console.log(err));
		};

		const onClick = (e) => {
			switch (e.target.nodeName.toLowerCase()) {
				case 'li':
					this.input.value = e.target.textContent;
					this.hideList(true);
					break;
				case 'button':
					this.reset();
					break;
			}
		};

		const selectItem = (num) => {
			if (ul.hidden) return;
			if (ul.selected) ul.selected.removeAttribute('class'); // remove prev selection
			ul.index = Math.min(Math.max(ul.index + num, -1), ul.childElementCount - 1); // set index between -1 and total items
			if (ul.index === -1) {
				this.input.value = userStr;
			} else {
				ul.selected = ul.children[ul.index];
				ul.selected.className = 'active';
				ul.selected.scrollIntoView(false);
				this.input.value = ul.selected.textContent;
			}
		};

		this.hideList = (bool) => {
			if (bool) {
				ul.hidden = true;
				ul.index = -1;
				this.input.focus();
			} else {
				ul.removeAttribute('hidden');
			}
		};

		ul.hidden = true;
		resetBtn.className = 'reset';
		resetBtn.textContent = '×';
		this.input.type = 'text';
		this.input.autofocus = true;
		this.input.placeholder = placeholder;
		this.fs.className = 'auto';
		this.fs.addEventListener('keydown', onKey); // use KeyboardEvent to capture specific keys
		this.fs.addEventListener('input', onInput); // use input Event to capture synchronous content change
		this.fs.addEventListener('click', onClick);
		this.fs.appendChild(this.input);
		this.fs.appendChild(ul);
		this.fs.appendChild(resetBtn);
		return this;
	},
	getVal() {
		return this.input.value;
	},
	reset() {
		this.input.value = '';
		this.hideList(true);
	},
};

const autoState = Object.create(autocomplete).init('Search states', 'http://localhost:3000/api/states');
document.getElementById('app').appendChild(autoState.fs);
