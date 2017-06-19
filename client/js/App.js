/* eslint "require-jsdoc": 0*/

'use strict';

import appStyles from '../sass/app.scss';

const autocomplete = {
	fs: document.createElement('fieldset'),
	input: document.createElement('input'),
	init(placeholder, api) {
		let strDflt = this.input.value;
		const ul = document.createElement('ul');

		const onKey = (e) => {
			switch (e.keyCode) {
				case 9: // Tab
				case 40: // Arrow Down
					focusItem(1);
					break;
				case 38: // Arrow Up
					focusItem(-1);
					break;
				case 27: // Escape
					this.input.value = strDflt;
				case 13: // Enter
					hideList(true);
					break;
				default:
					this.input.focus();
					getList();
			}
		};

		const onClick = (e) => {
			if (e.target.nodeName.toLowerCase() === 'li') {
				this.input.value = e.target.textContent;
				hideList(true);
			}
		};

		const getList = () => {
			if (this.input.value === strDflt) {
				return;
			} else {
				strDflt = this.input.value;
			}

			if (this.input.value.length < 2) {
				hideList(true);
				return;
			}

			const render = (obj) => {
				if (obj.count) {
					hideList(false);
				} else {
					hideList(true);
					return;
				}

				while (ul.lastChild) {
					ul.lastChild.remove();
				}
				ul.index = -1;
				obj.data.forEach((item) => {
					const li = document.createElement('li');
					li.textContent = item.name;
					li.setAttribute('tabindex', 0);
					ul.appendChild(li);
				});
			};

			xhrReq('GET', `${api}?term=${this.input.value}`).then(
				(obj) => render(obj), (err) => console.log(err)
			);
		};

		const hideList = (bool) => {
			if (bool) {
				ul.hidden = true;
				ul.index = -1;
				this.input.focus();
			} else {
				ul.removeAttribute('hidden');
			}
		};

		const focusItem = (num) => {
			if (ul.hidden) return;

			ul.index = Math.min(Math.max(ul.index + num, -1), ul.childElementCount - 1);
			if (ul.index === -1) {
				this.input.value = strDflt;
				this.input.focus();
			} else {
				this.input.value = ul.children[ul.index].textContent;
				ul.children[ul.index].focus();
			}
		};

		ul.index = -1;
		ul.hidden = true;
		this.input.type = 'text';
		this.input.autofocus = true;
		this.input.placeholder = placeholder;
		this.fs.addEventListener('keyup', onKey);
		this.fs.addEventListener('click', onClick);
		this.fs.appendChild(this.input);
		this.fs.appendChild(ul);

		return this;
	},
	clear() {
		this.input.value = '';
	},
	getVal() {
		return this.input.value;
	},
};

function xhrReq(method, url) {
	return new Promise(((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.responseType = 'json';
		xhr.onload = function() {
			if (xhr.status === 200) {
				resolve(xhr.response);
			} else {
				reject(`Oh Snap! ${xhr.statusText}`);
			}
		};
		xhr.onerror = function() {
			reject('There was a network error.');
		};
		xhr.send();
	}));
}

const stateFs = Object.create(autocomplete).init('Search states', 'http://localhost:3000/api/states');
document.getElementById('app').appendChild(stateFs.fs);
