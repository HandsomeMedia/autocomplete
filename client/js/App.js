/* eslint "require-jsdoc": 0*/

'use strict';

import appStyles from '../sass/app.scss';

const Autocomplete = {
	init(api) {
		this.form = document.createElement('form');
		const sel = document.createElement('select');
		const txt = document.createElement('input');
		txt.type = 'text';
		txt.autofocus = true;
		txt.placeholder = 'Search states';
		txt.addEventListener('input', updateSel);
		sel.addEventListener('click', handleUi);
		this.form.addEventListener('keydown', handleUi);
		this.form.appendChild(sel);
		this.form.appendChild(txt);

		function handleUi(e) {
			switch (e.keyCode) {
				case 40: // Arrow Down
					console.log(sel.selectedIndex);
					sel.selectedIndex = (sel.size === 1) ? 0 : sel.selectedIndex + 1;
					console.log(sel.selectedIndex);
					break;
				case 38: // Arrow Up
					sel.selectedIndex -= 1;
					break;
				case 8: // backspace
					txt.bksp = true;
					return;
					break;
				case 13: // Enter
				case undefined: // Pointer device
					hideSel(true);
					break;
				default:
					return;
			}
			txt.value = sel.value || txt.startVal;
			e.preventDefault();
		}

		function updateSel() {
      txt.startVal = txt.value;
			while (sel.lastChild) {
				sel.lastChild.remove();
			}
			if (txt.value.length < 2) return;
			xhrReq('GET', `${api}?term=${txt.value}`)
				.then((obj) => {
					obj.data.forEach((item) => {
						const opt = document.createElement('option');
						opt.value = opt.textContent = item.name;
						sel.appendChild(opt);
					});
					sel.size = Math.min(5, obj.count);

					if (sel.size === 1 && !txt.bksp) {
						txt.value = sel.firstChild.value;
						hideSel(true);
					} else {
            delete txt.bksp;
						sel.selectedIndex = -1;
						hideSel(false);
					}
				}, (err) => console.log(err));
		};

		function hideSel(hide) {
			if (hide) {
				sel.setAttribute('hidden', true);
			} else {
				sel.removeAttribute('hidden');
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
