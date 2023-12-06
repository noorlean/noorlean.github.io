class TbDb{
	#db;
	constructor(dbNam,stores=[],version){
		return new Promise((resolve, reject) => {
			let request = indexedDB.open(dbNam, version);
			request.onerror = event => {
				alert('Error Event, check console');
				console.error(event);
			}
			request.onupgradeneeded = event => {
				let db = event.target.result;
				stores.forEach(store => {
					if(!db.objectStoreNames.contains(store.name)) {
						let objectStore = db.createObjectStore(store.name, store.key);
						Object.keys(store.cols).forEach(col => {
							objectStore.createIndex(col, col, store.cols[col]);
						})
					}
				})
			};
			request.onsuccess = event => {
				this.#db = event.target.result;
				resolve(this);
			};
		});
	}

	getAll(store){
		return new Promise((resolve, reject) => {
			let transaction = this.#db.transaction(store, 'readwrite');
			const objectStore = transaction.objectStore(store);
			objectStore.getAll().onsuccess = event => {
				resolve(event.target.result);
			};
			transaction.onerror = event => {
				reject(event);
			};
		});
	}

	get(store,key){
		return new Promise((resolve, reject) => {
			let transaction = this.#db.transaction(store, 'readwrite');
			const objectStore = transaction.objectStore(store);
			objectStore.get(key).onsuccess = event => {
				resolve(event.target.result);
			};
			transaction.onerror = event => {
				reject(event);
			};
			
			
		});
	}

	getWhere(store,query){
		return new Promise((resolve, reject) => {
			let transaction = this.#db.transaction(store, 'readwrite');
			const objectStore = transaction.objectStore(store);
			objectStore.getAll().onsuccess = event => {
				const result = event.target.result;
				// const sortedResult = result.filter((obj) => values.includes(obj[index]) && )
				const sortedResult = result.filter((obj) => {
					for (var key in query) {
					//   if (obj[key] === undefined || obj[key] != query[key]){
					  if (obj[key] === undefined || !query[key].includes(obj[key])){
						  return false;
					  }
					}
					return true;
				});

				// console.log(sortedResult)
				// // console.log(result[0])
				// // console.log(sortedResult)
				resolve(sortedResult);
				// resolve(result,result[0]);
			};
			transaction.onerror = event => {
				reject(event);
			};
		});
	}

	accessObjectPath(obj, pathArray) {
		return pathArray.reduce((acc, key) => (acc && acc[key] !== 'undefined') ? acc[key] : undefined, obj);
	}

	search(store,query,str){
		return new Promise((resolve, reject) => {
			let transaction = this.#db.transaction(store, 'readwrite');
			const objectStore = transaction.objectStore(store);
			objectStore.getAll().onsuccess = event => {
				const result = event.target.result;
				const sortedResult = result.filter((obj) => {
					for (var key in query) {
						if(Array.isArray(query[key]) && this.accessObjectPath(obj,query[key]) && typeof this.accessObjectPath(obj,query[key]) == "string" && this.accessObjectPath(obj,query[key]).toLowerCase().includes(str.toLowerCase())){
							return true;
						}else if (typeof query[key] == 'string' && obj[key] !== undefined && obj[key].toLowerCase().includes(str.toLowerCase())){
							return true;
						}
						return false;	
					}
				});
				resolve(sortedResult);
			};
			transaction.onerror = event => {
				reject(event);
			};
		});
	}

	insert(store,obj){
		return new Promise((resolve, reject) => {
			let transaction = this.#db.transaction(store, 'readwrite');
			const objectStore = transaction.objectStore(store);
			var request = objectStore.add(obj);
			request.onsuccess = function (event) {
				resolve(event.target.result);
			};
			request.onerror = function (event) {
				reject(event);
			};
		});
	}

	update(store,key,obj){
		return new Promise((resolve, reject) => {
			let transaction = this.#db.transaction(store, 'readwrite');
			const objectStore = transaction.objectStore(store);
			const request = objectStore.get(key);
			request.onsuccess = event => {
				const data = event.target.result;
				Object.keys(obj).forEach(o => {
					data[o] = obj[o];
				});
				const requestUpdate = objectStore.put(data);
				requestUpdate.onsuccess = (event) => {
					resolve(event.target.result);
				};
				requestUpdate.onerror = (event) => {
					reject(event);
				};
			};
			request.onerror = event => {
				reject(event);
			};
		});
	}

	delete(store,key){
		return new Promise((resolve, reject) => {
			let transaction = this.#db.transaction(store, 'readwrite');
			const objectStore = transaction.objectStore(store);
			const request = objectStore.delete(key);
			request.oncomplete = event => {
				resolve(event.target.result);
			};
			request.onerror = event => {
				reject(event);
			};
		});
	}
}