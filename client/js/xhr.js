/* eslint "require-jsdoc": 0*/
export default (method, url)=>{
	return new Promise(((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.responseType = 'json';
		xhr.onload = ()=>{
			if (xhr.status === 200) {
				resolve(xhr.response);
			} else {
				reject(`Oh Snap! ${xhr.statusText}`);
			}
		};
		xhr.onerror = function() {
			reject('Oh Snap! There was an error.');
		};
		xhr.send();
	}));
};
