/* eslint "require-jsdoc": 0*/

'use strict';

import appStyles from '../sass/app.scss';

const Autocomplete = {
	init(api) {
		const ul = document.createElement('ul');
		const txt = document.createElement('input');
		txt.type = 'text';
		txt.autofocus = true;
		txt.placeholder = 'Search states';
		ul.index = -1;
		ul.addEventListener('click', handleUi);
		this.form = document.createElement('form');
		this.form.addEventListener('keyup', handleUi);
		this.form.appendChild(txt);
		this.form.appendChild(ul);

		function handleUi(e) {
			switch (e.keyCode) {
				case 40: // Arrow Down
					updateFocus(1);
					break;
				case 38: // Arrow Up
					updateFocus(-1);
					break;
				case 8: // Backspace
					txt.bksp = true;
					return;
					break;
				case 13: // Enter
				case undefined: // Pointer device
					hideSel(true);
					break;
				default:
					updateList();
					return;
			}
			e.preventDefault();
		}

		function updateFocus(num) {
			ul.index = Math.min(Math.max(ul.index + num, -1), ul.children.length - 1);
			if (ul.index === -1) {
				txt.value = txt.startVal;
				txt.focus();
			} else {
				txt.value = ul.children[ul.index].textContent;
				ul.children[ul.index].focus();
			}
		}

		function updateList() {
			txt.startVal = txt.value;
			while (ul.lastChild) {
				ul.lastChild.remove();
			}
			if (txt.value.length < 2) return;
			xhrReq('GET', `${api}?term=${txt.value}`)
				.then((obj) => {
					obj.data.forEach((item, i) => {
						const li = document.createElement('li');
						li.textContent = item.name;
						li.setAttribute('tabindex', i + 1);
						ul.appendChild(li);
					});
					ul.size = Math.min(5, obj.count);

					if (ul.size === 1 && !txt.bksp) {
						txt.value = ul.firstChild.textContent;
						hideSel(true);
					} else {
						delete txt.bksp;
						ul.selectedIndex = -1;
						hideSel(false);
					}
				}, (err) => console.log(err));
		};

		function hideSel(hide) {
			if (hide) {
				ul.setAttribute('hidden', true);
			} else {
				ul.removeAttribute('hidden');
			}
		}

		return this;
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

const stateSel = Object.create(Autocomplete).init('http://localhost:3000/api/states');
document.getElementById('app').appendChild(stateSel.form);
