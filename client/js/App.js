/* eslint "require-jsdoc": 0*/

'use strict';

import appStyles from '../sass/app.scss';

const Autocomplete = {
	init(api) {
		const field = document.createElement('fieldset');
		const ul = document.createElement('ul');
		const txt = document.createElement('input');
		txt.type = 'text';
		txt.autofocus = true;
		txt.placeholder = 'Search states';
		ul.index = -1;
		ul.hidden = true;
		field.addEventListener('keyup', handleKeyboard);
		field.addEventListener('click', handlePointer);
		field.appendChild(txt);
		field.appendChild(ul);

		function handleKeyboard(e) {
			switch (e.keyCode) {
				case 9: // Tab
				case 40: // Arrow Down
					focusList(1);
					break;
				case 38: // Arrow Up
					focusList(-1);
					break;
				case 27: // Escape
					txt.value = txt.startVal;
				case 13: // Enter
					hideList(true);
					break;
				default:
					txt.focus();
					updateList();
			}
		}

		function handlePointer(e) {
			const target = e.target;
			if (target.nodeName.toLowerCase() === 'li') {
				txt.value = target.textContent;
				hideList(true);
			}
		}

		function updateList() {
			if (txt.value === txt.startVal) {
				return;
			}
			ul.index = -1;
			txt.startVal = txt.value;
			if (txt.value.length < 2) {
				hideList(true);
				return;
			}

			xhrReq('GET', `${api}?term=${txt.value}`)
				.then((obj) => {
					if (obj.count) {
						hideList(false);
					} else {
						hideList(true);
						return;
					}
					obj.data.forEach((item, i) => {
						const li = ul.children[i] || document.createElement('li');
						li.textContent = item.name;
						if (!ul.contains(li)) {
							li.setAttribute('tabindex', 0);
							ul.appendChild(li);
						}
					});
					while (ul.childElementCount > obj.count) {
						ul.lastChild.remove();
					}
				}, (err) => console.log(err));
		};

		function focusList(num) {
			if (ul.hidden) return;

			ul.index = Math.min(Math.max(ul.index + num, -1), ul.childElementCount - 1);
			if (ul.index === -1) {
				txt.value = txt.startVal;
				txt.focus();
			} else {
				txt.value = ul.children[ul.index].textContent;
				ul.children[ul.index].focus();
			}
		}

		function hideList(bool) {
			if (bool) {
				ul.hidden = true;
				ul.index = -1;
				txt.focus();
			} else {
				ul.removeAttribute('hidden');
			}
		}

		return field;
	},
	clear() {
		console.log(this);
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

const stateField = Object.create(Autocomplete);
document.getElementById('app').appendChild(stateField.init('http://localhost:3000/api/states'));
stateField.clear();
console.log(Autocomplete.isPrototypeOf(stateField));
