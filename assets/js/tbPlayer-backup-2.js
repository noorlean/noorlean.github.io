
//downalod - share - popup - autoplay next 
class TbPlayer{
	#appEle;
	#overlayEle;
	#tabsEle;
	#tabHomeEle;
	#mediaFormUrlInput;
	#mediaFormBtn;
	#tabRecentEle;
	#tabPlaylistsEle;
	#tabSettingsEle;
	#playerEle;
	#playerVideoConEle;
	#playerVideoEle;
	#playerControlsEle;
	#playerMediaSettingsBtn;
	#mediaSettingModalQualitySelect;
	#playerPlayPauseBtn;
	#playerProgressEle;
	#playerProgressInput;
	#playerElapsedTimeEle;
	#playerDurationEle;
	#playerFullscreenBtn;
	#palyerItemsListEle;
	#db;
	#html;
	#pressTimer;
	#controlsVisibilityTimer;
	#isLongPressed = false;
	#mediaSettingModal;
	constructor(sel,db){
		if (typeof sel == "object"){
			this.#appEle = sel;
		}else if (typeof sel == "string"){
			this.#appEle = document.querySelector(sel);
		}
		this.#overlayEle = document.querySelector(".overlay");
		this.#tabsEle = document.querySelector(".site-tabs");
		new TbTabs(this.#tabsEle);
		this.#tabHomeEle = document.getElementById("app-tab-home");
		this.#mediaFormUrlInput = this.#tabHomeEle.querySelector("#site-media-url-input");
		this.#mediaFormBtn = this.#tabHomeEle.querySelector("#site-media-get-btn");
		this.#mediaFormBtn.addEventListener("click", (e) => {
			this.#fetchUrl(this.#mediaFormUrlInput.value).then(res => {
				const streamingData = res.data.streamingData;
				const videoDetails = res.data.videoDetails;
				const now = new Date().getTime() / 1000;
				const obj = {
					title : videoDetails.title,
					type : res.type,
					thumbnail : videoDetails.thumbnail.thumbnails[0].url,
					// videoId : videoDetails.videoId,
					url: this.#mediaFormUrlInput.value,
					streamingData : streamingData,
					expire : parseInt(streamingData.expiresInSeconds) + now
					// formats : {...streamingData.adaptiveFormats,...streamingData.formats},
				};

				this.#db.insert("media", obj).then(res => {
					this.#updateRecentItems();
				})
			}).catch(err => {
				console.log(err)
			})
		});

		this.#tabRecentEle = document.getElementById("app-tab-recent");
		this.#tabPlaylistsEle = document.getElementById("app-tab-playlists");
		this.#tabSettingsEle = document.getElementById("app-tab-settings");
		this.#playerEle = document.querySelector(".site-player");
		this.#playerVideoConEle = this.#playerEle.querySelector(".site-player-video");
		this.#playerVideoEle = this.#playerEle.querySelector(".site-player-video video");
		this.#playerControlsEle = this.#playerEle.querySelector(".site-player-controls");
		this.#playerMediaSettingsBtn = this.#playerEle.querySelector(".site-palyer-media-setting-btn");
		this.#playerPlayPauseBtn = this.#playerEle.querySelector(".site-player-play-pause");
		this.#playerProgressEle = this.#playerEle.querySelector(".site-player-progressbar");
		this.#playerProgressInput = this.#playerProgressEle.querySelector("input");
		this.#playerElapsedTimeEle = this.#playerEle.querySelector(".site-player-elapsed-time");
		this.#playerDurationEle = this.#playerEle.querySelector(".site-player-duration");
		this.#playerFullscreenBtn = this.#playerEle.querySelector(".site-player-fullscreen");

		this.#palyerItemsListEle = this.#playerEle.querySelector(".site-player-list-items");
		this.#db = db;
		this.#html = new Html();


		
		// const pop2 = new TbModal({
		// 	title:"Add Playlist 22",
		// 	button: this.#html.addButton({class:"xxx",parent:document.body})
		// });
		this.#init();
	}

	#init(){
		this.#recentUi();
		this.#playlistsUi();
		this.#updateRecentItems();
		this.updatePlaylistItems();
		this.#playerUi();

	}

	#itemUi(item, type = "media"){
		// const itemEle = this.#html.addEle({class:["site-player-item","ripple"],parent:parent});
		const itemEle = this.#html.addEle({class:"site-player-item"});
		itemEle.dataset.id = item.id;
		const itemConEle = this.#html.addEle({class:"site-player-item-con",parent:itemEle});
		const selEle = this.#html.addEle({class:"site-player-item-sel",parent:itemConEle});
		const check = this.#html.addEle({class:"site-check-mark",parent:selEle});
		this.#html.addEle({type:"span",parent:check});

		//<div class="site-check-mark"><span></span></div>
		// const selEleInput = this.#html.addInput({class:"site-player-item-sel-input",type:"checkbox",parent:selEle});
	
		const thumbEle = this.#html.addEle({class:"site-player-item-thumb",parent:itemConEle});
		const thumbConEle = this.#html.addEle({parent:thumbEle});
		const thumbImg = document.createElement("img");
		thumbImg.src = item.thumbnail;
		thumbConEle.appendChild(thumbImg);
		

		const itemInfoEle = this.#html.addEle({class:"site-player-item-info",parent:itemConEle});
		const itemTitle = this.#html.addEle({class:"site-player-item-title",parent:itemInfoEle});
		itemTitle.textContent = item.title;
		// console.log(type)
		if(type == "playlist"){
			itemEle.classList.add("site-player-item-playlist");
			const videoNums = this.#html.addEle({class:"site-player-item-nums",parent:itemInfoEle});
			videoNums.textContent = item.items.size + " videos";
			// console.log(item.items.size)
		}else{
			// console.log(8955555)
		}
		return itemEle;
		// this.#playerItemsEle = this.#html.addEle({class:"site-player-items",parent:this.#appEle});
	}

	#getUrlInfo(url){
		let urlInfo = null;
		if(url && this.#isValidUrl(url)){
			let regxYoutube =  /^(?:http(?:s)?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user|shorts)\/))([^\?&\"'>]+)/;
			if(url.match(regxYoutube)){
				urlInfo = {id:url.match(regxYoutube)[1],type:"youtube"};
			}
		}
		return urlInfo;
	}

	#fetchUrl(url){
		return new Promise((resolve,reject) => {
			const urlInfo = this.#getUrlInfo(url);
			if(urlInfo){
				// https://www.youtube.com/watch?v=7Nvrqa6CmjE
				// fetch("http://localhost/php/?id="+urlInfo.id+"&type="+urlInfo.type)
				// fetch("http://localhost/php/?id=https://www.youtube.com/watch?v=_ZvnD73m40o")
				// fetch("http://localhost/php/?id=https://www.youtube.com/watch?v=Dorf8i6lCuk")
				// fetch("http://localhost/php/?id=https://www.youtube.com/watch?v=YA0KB2DPJms")
				// fetch("http://localhost/php/?id=Dorf8i6lCuk&type=youtube")
				// fetch("http://localhost/php/?id=YA0KB2DPJms&type=youtube")
				try {
					fetch("http://localhost/php/?id="+urlInfo.id+"&type="+urlInfo.type)
					.then(res => {
						if (res.ok) return res.text();
						return res.text().then(res => {throw new Error(res.error)})
					})
					.then(text => { 
						resolve({data:JSON.parse(text),type:urlInfo.type});
					})
					.catch(error => reject(error.message))
					
					// .then(res => res.text())
					// .then(text =>{
					// 	// const jsonObj = JSON.parse(text);
					// 	resolve(JSON.parse(text),urlInfo.type);
					// 	/*
					// 	const streamingData = jsonObj.streamingData;
					// 	const videoDetails = jsonObj.videoDetails;
					// 	const now = new Date().getTime() / 1000;
		
					// 	const obj = {
					// 		title : videoDetails.title,
					// 		type : urlInfo.type,
					// 		thumbnail : videoDetails.thumbnail.thumbnails[0].url,
					// 		// videoId : videoDetails.videoId,
					// 		url: url,
					// 		streamingData : streamingData,
					// 		expire : parseInt(streamingData.expiresInSeconds) + now,
					// 		// formats : {...streamingData.adaptiveFormats,...streamingData.formats},
					// 	};
		
					// 	this.#db.insert("media", obj).then(res => {
					// 		this.#updateRecentItems();
					// 	})
		
					// 	console.log(jsonObj);
					// 	*/
	
	
					// 	// console.log(obj);
		
					// 	// console.log(jsonObj.streamingData)
					// }).catch(err){
					// 	reject(error.message)
					// }

					
					
				}catch(error) {
					reject(error.message)
				}
			}else{
				reject("Please insert vaild URL.");
			}
		})
		
	
		
	}

	#isValidUrl(string) {
		try {
			const newUrl = new URL(string);
			return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
		} catch (err) {
			return false;
		}
	}

	#recentUi(){
		const parent = this.#tabRecentEle.querySelector(".site-list-items");
		const toolsEle = this.#tabRecentEle.querySelector(".site-tabs-tools");
		const searchBtn = this.#html.addButton({
			class:["site-tabs-tool","site-recent-search-btn"],
			text:'<svg viewBox="0 0 24 24"><path d="M18.7,19.9L15,16.2c-0.6,0.5-1.2,0.8-1.9,1.1c-0.7,0.3-1.5,0.4-2.3,0.4c-1.9,0-3.5-0.7-4.8-2s-2-2.9-2-4.8C4,9,4.7,7.3,6,6C7.3,4.7,9,4,10.9,4c1.9,0,3.5,0.7,4.8,2s2,2.9,2,4.8c0,0.8-0.1,1.6-0.4,2.3c-0.3,0.7-0.6,1.4-1.1,1.9l3.7,3.7c0.1,0.1,0.1,0.3,0,0.4l-0.8,0.8C19,20,18.8,20,18.7,19.9z M10.9,16c1.4,0,2.7-0.5,3.7-1.5c1-1,1.5-2.2,1.5-3.7s-0.5-2.7-1.5-3.7c-1-1-2.2-1.5-3.7-1.5c-1.4,0-2.7,0.5-3.7,1.5c-1,1-1.5,2.2-1.5,3.7s0.5,2.7,1.5,3.7C8.2,15.5,9.4,16,10.9,16z"/></svg>',
			parent:toolsEle
		});

		const openPlaylistFormModal = this.#html.addButton({
			class:["site-tabs-tool","site-palylist-add-btn"],
			text:'<svg viewBox="0 -960 960 960"><path d="M130.001-330.001v-59.998h280v59.998h-280Zm0-160v-59.998h440v59.998h-440Zm0-160v-59.998h440v59.998h-440Zm520 480v-160h-160v-59.998h160v-160h59.998v160h160v59.998h-160v160h-59.998Z"/></svg>',
			parent:toolsEle,
		});

		// const addPlaylistModalContentEle = this.#html.addEle({class:"site-form"});
		// const addPlaylistModalGridEle = this.#html.addEle({class:"grid-1",parent:addPlaylistModalContentEle});
		// const addPlaylistModalInputCon = this.#html.addEle({class:"site-form-control",parent:addPlaylistModalGridEle});
		// const addPlaylistModalInput = this.#html.addInput({parent:addPlaylistModalInputCon});
		// const addPlaylistModalBtnsCon = this.#html.addEle({class:"site-form-btns",parent:addPlaylistModalContentEle});
		// const addPlaylistModalBtn = this.#html.addButton({class:["site-form-btn","site-form-btn-active"],text:'Add',parent:addPlaylistModalBtnsCon});

		const addPlaylistModalForm = this.#html.addEle({class:"site-form"});
		const addPlaylistModalFormMsgs = this.#html.addEle({class:"site-form-msgs",parent:addPlaylistModalForm});
		const addPlaylistModalFormRow = this.#html.addEle({class:"site-form-row",parent:addPlaylistModalForm});
		const addPlaylistModalInput = this.#html.addInput({class:"site-form-control",placeholder:"Playlist Name",parent:addPlaylistModalFormRow});
		const addPlaylistModalBtn = this.#html.addButton({class:["site-form-btn","site-form-btn-active"],text:'Create',parent:addPlaylistModalFormRow});
		const modalPlaylistsEle = this.#html.addEle({class:"site-modal-playlists",parent:addPlaylistModalForm});
		this.#updateModalPlaylistsItems(modalPlaylistsEle);


		const addPlaylistModal = new TbModal({
			title:"Add Playlist",
			button: openPlaylistFormModal,
			content: addPlaylistModalForm
		});
		
		addPlaylistModalBtn.addEventListener("click", (e) => {
			this.#addPlaylist(addPlaylistModalInput,addPlaylistModalFormMsgs).then(res => {
				setTimeout(() => {
					// console.log(addPlaylistModal)
					this.updatePlaylistItems();
					this.#updateModalPlaylistsItems(modalPlaylistsEle);
					this.#overlayEle.style.display = "none";
					addPlaylistModal.close();
					this.#clearSel(this.#tabRecentEle)
				},500)
			})
		});
		

		const delteItemBtn = this.#html.addButton({
			class:["site-tabs-tool","site-recent-delete-btn"],
			text:'<svg viewBox="0 -960 960 960"><path d="M292.309-140.001q-29.923 0-51.115-21.193-21.193-21.192-21.193-51.115V-720h-40v-59.999H360v-35.384h240v35.384h179.999V-720h-40v507.691q0 30.308-21 51.308t-51.308 21H292.309ZM680-720H280v507.691q0 5.385 3.462 8.847 3.462 3.462 8.847 3.462h375.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463V-720ZM376.155-280h59.999v-360h-59.999v360Zm147.691 0h59.999v-360h-59.999v360ZM280-720v520-520Z"/></svg>',
			parent:toolsEle,
		});

		const clearSelBtn = this.#html.addButton({
			class:["site-tabs-tool","site-recent-clear-selection"],
			text:'<svg viewBox="0 -960 960 960"><path d="M290.001-450.001h379.998v-59.998H290.001v59.998Zm190.066 350q-78.836 0-148.204-29.92-69.369-29.92-120.682-81.21-51.314-51.291-81.247-120.629-29.933-69.337-29.933-148.173t29.92-148.204q29.92-69.369 81.21-120.682 51.291-51.314 120.629-81.247 69.337-29.933 148.173-29.933t148.204 29.92q69.369 29.92 120.682 81.21 51.314 51.291 81.247 120.629 29.933 69.337 29.933 148.173t-29.92 148.204q-29.92 69.369-81.21 120.682-51.291 51.314-120.629 81.247-69.337 29.933-148.173 29.933ZM480-160q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
			parent:toolsEle,
		});
		
		clearSelBtn.addEventListener("click", (e) => this.#clearSel(this.#tabRecentEle));
		// addPlaylistBtn.addEventListener("click", (e) => {
		// 	e.preventDefault();
		// 	this.#openModal("site-popup-playlist")
		// });	
		
		// const parent = this.#html.addEle({class:"site-list-items",parent:this.#tabRecentEle.querySelector("site-tabs-con")});
		// console.log(parent)
		
	}

	#playlistsUi(){
		const parent = this.#tabPlaylistsEle.querySelector(".site-list-items");
		const toolsEle = this.#tabPlaylistsEle.querySelector(".site-tabs-tools");
		// const searchBtn = this.#html.addButton({
		// 	class:["site-tabs-tool","site-recent-search-btn"],
		// 	text:'<svg viewBox="0 0 24 24"><path d="M18.7,19.9L15,16.2c-0.6,0.5-1.2,0.8-1.9,1.1c-0.7,0.3-1.5,0.4-2.3,0.4c-1.9,0-3.5-0.7-4.8-2s-2-2.9-2-4.8C4,9,4.7,7.3,6,6C7.3,4.7,9,4,10.9,4c1.9,0,3.5,0.7,4.8,2s2,2.9,2,4.8c0,0.8-0.1,1.6-0.4,2.3c-0.3,0.7-0.6,1.4-1.1,1.9l3.7,3.7c0.1,0.1,0.1,0.3,0,0.4l-0.8,0.8C19,20,18.8,20,18.7,19.9z M10.9,16c1.4,0,2.7-0.5,3.7-1.5c1-1,1.5-2.2,1.5-3.7s-0.5-2.7-1.5-3.7c-1-1-2.2-1.5-3.7-1.5c-1.4,0-2.7,0.5-3.7,1.5c-1,1-1.5,2.2-1.5,3.7s0.5,2.7,1.5,3.7C8.2,15.5,9.4,16,10.9,16z"/></svg>',
		// 	parent:toolsEle
		// });

		const editPlaylistFormModal = this.#html.addButton({
			class:["site-tabs-tool","site-palylist-add-btn"],
			text:'<svg viewBox="0 -960 960 960"><path d="M130.001-330.001v-59.998h280v59.998h-280Zm0-160v-59.998h440v59.998h-440Zm0-160v-59.998h440v59.998h-440Zm520 480v-160h-160v-59.998h160v-160h59.998v160h160v59.998h-160v160h-59.998Z"/></svg>',
			parent:toolsEle,
		});

		// const addPlaylistModalContentEle = this.#html.addEle({class:"site-form"});
		// const addPlaylistModalGridEle = this.#html.addEle({class:"grid-1",parent:addPlaylistModalContentEle});
		// const addPlaylistModalInputCon = this.#html.addEle({class:"site-form-control",parent:addPlaylistModalGridEle});
		// const addPlaylistModalInput = this.#html.addInput({parent:addPlaylistModalInputCon});
		// const addPlaylistModalBtnsCon = this.#html.addEle({class:"site-form-btns",parent:addPlaylistModalContentEle});
		// const addPlaylistModalBtn = this.#html.addButton({class:["site-form-btn","site-form-btn-active"],text:'Add',parent:addPlaylistModalBtnsCon});

		const editPlaylistModalForm = this.#html.addEle({class:"site-form"});
		const editPlaylistModalFormMsgs = this.#html.addEle({class:"site-form-msgs",parent:editPlaylistModalForm});
		const editPlaylistModalFormRow = this.#html.addEle({class:"site-form-row",parent:editPlaylistModalForm});
		const editPlaylistModalInput = this.#html.addInput({class:"site-form-control",placeholder:"Playlist Name",parent:editPlaylistModalFormRow});
		const editPlaylistModalBtn = this.#html.addButton({class:["site-form-btn","site-form-btn-active"],text:'Update',parent:editPlaylistModalFormRow});


		const editPlaylistModal = new TbModal({
			title:"Edit Playlist",
			button: editPlaylistFormModal,
			content: editPlaylistModalForm
		});
		
		editPlaylistModalBtn.addEventListener("click", (e) => {
			// this.#editPlaylist(editPlaylistModalInput,editPlaylistModalFormMsgs).then(res => {
			// 	setTimeout(() => {
			// 		// console.log(editPlaylistModal)
			// 		this.updatePlaylistItems();
			// 		this.#overlayEle.style.display = "none";
			// 		editPlaylistModal.close();
			// 		this.#clearSel(this.#tabPlaylistsEle)
			// 	},500)
			// })
		});
		

		const delteItemBtn = this.#html.addButton({
			class:["site-tabs-tool","site-recent-delete-btn"],
			text:'<svg viewBox="0 -960 960 960"><path d="M292.309-140.001q-29.923 0-51.115-21.193-21.193-21.192-21.193-51.115V-720h-40v-59.999H360v-35.384h240v35.384h179.999V-720h-40v507.691q0 30.308-21 51.308t-51.308 21H292.309ZM680-720H280v507.691q0 5.385 3.462 8.847 3.462 3.462 8.847 3.462h375.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463V-720ZM376.155-280h59.999v-360h-59.999v360Zm147.691 0h59.999v-360h-59.999v360ZM280-720v520-520Z"/></svg>',
			parent:toolsEle,
		});

		const clearSelBtn = this.#html.addButton({
			class:["site-tabs-tool","site-recent-clear-selection"],
			text:'<svg viewBox="0 -960 960 960"><path d="M290.001-450.001h379.998v-59.998H290.001v59.998Zm190.066 350q-78.836 0-148.204-29.92-69.369-29.92-120.682-81.21-51.314-51.291-81.247-120.629-29.933-69.337-29.933-148.173t29.92-148.204q29.92-69.369 81.21-120.682 51.291-51.314 120.629-81.247 69.337-29.933 148.173-29.933t148.204 29.92q69.369 29.92 120.682 81.21 51.314 51.291 81.247 120.629 29.933 69.337 29.933 148.173t-29.92 148.204q-29.92 69.369-81.21 120.682-51.291 51.314-120.629 81.247-69.337 29.933-148.173 29.933ZM480-160q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>',
			parent:toolsEle,
		});
		
		clearSelBtn.addEventListener("click", (e) => this.#clearSel(this.#tabPlaylistsEle));
		// addPlaylistBtn.addEventListener("click", (e) => {
		// 	e.preventDefault();
		// 	this.#openModal("site-popup-playlist")
		// });	
		
		// const parent = this.#html.addEle({class:"site-list-items",parent:this.#tabRecentEle.querySelector("site-tabs-con")});
		// console.log(parent)
		
	}

	#updateRecentItems(){
		const listItemsEle = this.#tabRecentEle.querySelector(".site-list-items");
		listItemsEle.innerHTML = "";
		// this.#tabRecentEle
		this.#db.getAll("media").then(data => {
			data.forEach(obj => {
				const ele = this.#itemUi(obj);
				listItemsEle.prepend(ele);

				// ele.addEventListener('pointerdown' , e => {
				// 	console.log(e.pointerType)
				// });
				ele.addEventListener('pointerdown' , e => this.#itemMouseDown(ele,this.#tabRecentEle));
				ele.addEventListener('pointerup' , e => this.#itemMouseUp(ele,obj,this.#tabRecentEle));
				// ele.addEventListener('touchstart' , e => this.#itemMouseDown(ele,parent));
				// ele.addEventListener('touchend' , e => this.#itemMouseUp(ele,parent));
				// ele.addEventListener('click' , this.#itemClick);
			});
		})
	}

	#updatePlayerListItems(playlistId = null){
		return new Promise((resolve) => {
			this.#palyerItemsListEle.innerHTML = "";
			// this.#tabRecentEle
			if(playlistId && typeof playlistId == "number"){
				this.#db.get("playlists",playlistId).then(pl => {
					console.log(pl);

				});
			}else{
				this.#db.getAll("media").then(data => {
					data.forEach(obj => {
						const ele = this.#itemUi(obj);
						this.#palyerItemsListEle.prepend(ele);
						ele.addEventListener('click' , (e) => this.#playerItemClick(e));
		
						// ele.addEventListener('pointerdown' , e => {
						// 	console.log(e.pointerType)
						// });
		
						/*
						ele.addEventListener('pointerdown' , e => this.#itemMouseDown(ele,this.#tabRecentEle));
						ele.addEventListener('pointerup' , e => this.#itemMouseUp(ele,this.#tabRecentEle));
						*/
		
						// ele.addEventListener('touchstart' , e => this.#itemMouseDown(ele,parent));
						// ele.addEventListener('touchend' , e => this.#itemMouseUp(ele,parent));
					});
					resolve();
				});
	
			}
			
		})

		//scroll to list item
	}

	#playerItemClick(e){
		e.stopPropagation();
		console.log(7878)
	}

	updatePlaylistItems(){
		const listItemsEle = this.#tabPlaylistsEle.querySelector(".site-list-items");
		listItemsEle.innerHTML = "";
		// this.#tabRecentEle
		this.#db.getAll("playlists").then(data => {
			data.forEach(obj => {
				const ele = this.#itemUi(obj,"playlist");
				listItemsEle.prepend(ele);
				// ele.addEventListener('pointerdown' , e => this.#itemMouseDown(ele,this.#tabPlaylistsEle));
				// ele.addEventListener('pointerup' , e => this.#itemMouseUp(ele,this.#tabPlaylistsEle));
				// ele.addEventListener('touchstart' , e => this.#itemMouseDown(ele,parent));
				// ele.addEventListener('touchend' , e => this.#itemMouseUp(ele,parent));
				// ele.addEventListener('click' , this.#itemClick);
			});
		})
	}

	#updateModalPlaylistsItems(ele){
		ele.innerHTML = "";
		// this.#tabRecentEle
		this.#db.getAll("playlists").then(data => {
			if(data.length){
				const con = this.#html.addEle({class:"site-modal-playlists-con",parent:ele});
				this.#html.addEle({class:"site-popup-title",parent:con,content:"Current Playlists"});
				const list = this.#html.addEle({class:"site-modal-playlists-items",parent:con});
				data.forEach(obj => {
					const ele = this.#itemUi(obj,"playlist");
					list.prepend(ele);
					// ele.addEventListener('pointerdown' , e => this.#itemMouseDown(ele,this.#tabPlaylistsEle));
					// ele.addEventListener('pointerup' , e => this.#itemMouseUp(ele,this.#tabPlaylistsEle));
					// ele.addEventListener('touchstart' , e => this.#itemMouseDown(ele,parent));
					// ele.addEventListener('touchend' , e => this.#itemMouseUp(ele,parent));
					// ele.addEventListener('click' , this.#itemClick);
				});

			}
		})
	}

	#itemMouseDown(ele,parent) {
		this.#pressTimer = window.setTimeout(() => this.#longPressed(ele,parent), 500);
		// this.#pressTimer = performance.now();
	};

	#itemMouseUp(ele,obj,parent){
		clearTimeout(this.#pressTimer);
		if(this.#isLongPressed){
			this.#isLongPressed = false;
		}else{
			if(parent.classList.contains("site-player-show-selection")){
				// parent.classList.add("site-player-show-selection");
				ele.classList.toggle("site-player-item-selected");
				this.#enableTools(parent);
			}else{
				this.#playVideo(obj,ele,"recent");
				this.#updatePlayerListItems();
				// console.log('click',ele);
				//open player videio
			}
		}
	};
	
	#longPressed(ele,parent){
		this.#isLongPressed = true;
		if(!parent.classList.contains("site-player-show-selection")){
			parent.classList.add("site-player-show-selection");
			ele.classList.add("site-player-item-selected");
			this.#enableTools(parent);
		}
	}

	#clearSel(tabEle){
		tabEle.classList.remove("site-player-show-selection");
		tabEle.querySelectorAll(".site-player-item-selected").forEach(sel => {
			sel.classList.remove("site-player-item-selected");
		});
	}

	#enableTools(tabEle){
		if(tabEle.querySelectorAll(".site-player-item-selected").length > 0){
			tabEle.classList.add("site-player-enable-tools");
		}else{
			tabEle.classList.remove("site-player-enable-tools");
		}
	}

	#addPlaylist(input,msgsEle){
		return new Promise((resolve) => {
			msgsEle.innerHTML = "";
			if(this.#isEmpty(input.value)){
				msgsEle.appendChild(this.#addFormMsg("Please add playlist name."));
			}else{
				this.#db.getWhere("playlists",{
					title:[input.value],
				}).then(data => {
					if(data.length){
						msgsEle.appendChild(this.#addFormMsg('Playlist <b>"'+input.value+'"</b> already exist.'));
					}else{
						const selectedItems = Array.from(this.#tabRecentEle.querySelectorAll(".site-player-item-selected"));
						const ids = selectedItems.length ? selectedItems.map(sel => parseInt(sel.dataset.id)) : null;
						if(ids.length){
							this.#db.get("media",ids[0]).then(firstObj => {
								const thumbnail = firstObj.thumbnail;
								this.#db.insert("playlists", {
									title : input.value,
									thumbnail : thumbnail,
									items : new Set(ids),
								}).then(playlistId => {
									resolve(playlistId);
								})
							});
						}
					}
				});
			}
        })

		
	}

	#playVideo(obj,ele,playList){
		// "21540"
		// const firstFormat = Object.keys(obj.formats).find(format => obj.formats[format].quality == "medium");
		// this.#overlayEle.style.display = "flex";

		if(!this.#playerEle.classList.contains("site-player-show")){
			this.#playerEle.classList.add("site-player-show");
		}

		if(this.#playerEle.classList.contains("site-palyer-collapse")){
			this.#playerEle.classList.remove("site-palyer-collapse");
		}

		const now = new Date().getTime() / 1000;
		if(now < obj.expire){
			// const firstFormat =  Object.values(obj.streamingData.formats).filter(f => f.quality == "medium");
			this.#playerVideoEle.src = obj.streamingData.formats[0].url;
			this.#updateMediaSettingsUi(obj);
			//console.log(obj,"open player and use db links");
		}else{
			this.#fetchUrl(obj.url).then(res => {
				const streamingData = res.data.streamingData;
				const id = parseInt(ele.dataset.id);
				this.#db.update("media",id, {
					streamingData : streamingData,
					expire : parseInt(streamingData.expiresInSeconds) + now
				}).then(r => {
					this.#updateRecentItems();
					this.#playerVideoEle.src = streamingData.formats[0].url;
					this.#updateMediaSettingsUi(res.data);
					//play the video
				});

			}).catch(err => {
				console.log(err)
			})
			// console.log(obj.expire,"open player and fetch url")
		}

		// const sd = obj.streamingData;
		// console.log(sd.expiresInSeconds)

		/*
		const firstFormat =  Object.values(obj.formats).filter(f => f.quality == "medium");
		this.#playerVideoEle.src = obj.formats[0].url;
		this.#playerEle.classList.add("site-player-show");
		console.log(obj)
		*/

		// this.#playerVideoEle = this.#playerEle.querySelector(".site-player-video video");
		// this.#palyerItemsListEle = this.#playerEle.querySelector(".site-list-items");
	}

	#updateMediaSettingsUi(obj){
		// const formats = [...obj.streamingData.formats,...obj.streamingData.adaptiveFormats];
		// const filteredFormats = formats.filter(format => Boolean(format.audioQuality))

		//this.#mediaSettingModalQualitySelect

		obj.streamingData.formats.forEach((f,i) => {
			// console.log(f)
			// this.#mediaSettingModalQualitySelect
			this.#mediaSettingModalQualitySelect.add(new Option(f.qualityLabel, i));
			// if(defaults["selected"] && defaults["selected"] == o){
			// 	this.#mediaSettingModalQualitySelect.add(new Option(defaults["options"][o], o,false,true));
			// }else{
			// 	this.#mediaSettingModalQualitySelect.add(new Option(defaults["options"][o], o));
			// }
		})

		this.#mediaSettingModalQualitySelect.addEventListener("change",(e) => {
			const currentTime = Math.round(this.#playerVideoEle.currentTime)
			this.#playerEle.classList.add("site-player-loading");
			this.#playerVideoEle.pause();
			this.#playerVideoEle.src = obj.streamingData.formats[e.target.value].url;
			// console.log(obj.streamingData.formats[e.target.value]);
			this.#playerVideoEle.play();
			this.#playerVideoEle.currentTime = currentTime;
			// console.log(currentTime)
		})

		
	}

	#playerUi(){
		/*
		// const addPlaylistModalContentEle = this.#html.addEle({class:"site-form"});
		// const addPlaylistModalGridEle = this.#html.addEle({class:"grid-1",parent:addPlaylistModalContentEle});
		// const addPlaylistModalInputCon = this.#html.addEle({class:"site-form-control",parent:addPlaylistModalGridEle});
		// const addPlaylistModalInput = this.#html.addInput({parent:addPlaylistModalInputCon});
		// const addPlaylistModalBtnsCon = this.#html.addEle({class:"site-form-btns",parent:addPlaylistModalContentEle});
		// const addPlaylistModalBtn = this.#html.addButton({class:["site-form-btn","site-form-btn-active"],text:'Add',parent:addPlaylistModalBtnsCon});

		const editPlaylistModalForm = this.#html.addEle({class:"site-form"});
		const editPlaylistModalFormMsgs = this.#html.addEle({class:"site-form-msgs",parent:editPlaylistModalForm});
		const editPlaylistModalFormRow = this.#html.addEle({class:"site-form-row",parent:editPlaylistModalForm});
		const editPlaylistModalInput = this.#html.addInput({class:"site-form-control",placeholder:"Playlist Name",parent:editPlaylistModalFormRow});
		const editPlaylistModalBtn = this.#html.addButton({class:["site-form-btn","site-form-btn-active"],text:'Update',parent:editPlaylistModalFormRow});
		*/

		const mediaSettingModalCon = this.#html.addEle({class:"site-media-settings"});
		const mediaSettingModalQualityGroup = this.#html.addEle({class:"site-form-group",parent:mediaSettingModalCon});
		this.#html.addEle({class:"site-form-label",parent:mediaSettingModalQualityGroup,content:"Quality:"});
		this.#mediaSettingModalQualitySelect = this.#html.addInput({class:"site-form-control",type:"select",parent:mediaSettingModalQualityGroup});
		this.#mediaSettingModal = new TbModal({
			closeBtn:false,
			// button: this.#playerMediaSettingsBtn,
			content: mediaSettingModalCon
		});

		// this.#playerProgressEle.addEventListener("click",e => {
		// 	e.stopPropagation();
		// 	clearTimeout(this.#controlsVisibilityTimer);
		// 	this.#controlsVisibilityTimer = setTimeout(() => this.#playerVideoConEle.classList.add("site-player-controls-hide"),3000);
		// });

		let isDown = false;
		let pointerPos = {};
		let offset = {};
		let appEleCoords = null;
		let resizedPlayerH = 0;
		let coords = null;
		const resizeTo = 50;
		this.#playerVideoEle.addEventListener('loadedmetadata',(e) => this.#initializeVideo());

		/*

		this.#playerPlayPauseBtn.addEventListener("click",(e) => {
			e.stopPropagation();
			clearTimeout(this.#controlsVisibilityTimer);
			this.#controlsVisibilityTimer = setTimeout(() => this.#playerVideoConEle.classList.add("site-player-controls-hide"),3000);
			this.#togglePlay();
		});

		this.#playerVideoConEle.addEventListener("click",(e) => {
			this.#toggleControls();
		});
		*/

		// this.#playerEle.addEventListener("mousedown",(e) => {
		this.#playerVideoConEle.addEventListener("touchstart",(e) => {
			let evt  = e.changedTouches[0];
			isDown = true;
			appEleCoords = this.#appEle.getBoundingClientRect();
			coords = this.#playerEle.getBoundingClientRect();
			resizedPlayerH = this.#tabsEle.querySelector(".site-tabs-btns").getBoundingClientRect().height + resizeTo;
			pointerPos.x = evt.clientX;
			pointerPos.y = evt.clientY;
			offset.x = evt.clientX - coords.left;
			offset.y = evt.clientY- coords.top;
			console.log("mousedown")
		});

		// document.addEventListener("mousemove",(e) => {
		document.addEventListener("touchmove",(e) => {
			/*
			if(!isDown){
				let evt  = e.changedTouches[0];
				let y = (evt.clientY - offset.y);
				let top = y >= 0 ? y <= (appEleCoords.height - resizedPlayerH) ? y : (appEleCoords.height - resizedPlayerH) : 0;
				// let y = (evt.clientY - offset.y);
				// let top = (y >= 0) ? (y >  appEleCoords.height - resizedH) ? y : (appEleCoords.height - resizedH) : 0;
				let h = (appEleCoords.height - y) >= resizedPlayerH ? (appEleCoords.height - y) : resizedPlayerH;
				// let x = evt.clientX - coords.left;
				this.#playerEle.style.top = top +"px";
				this.#playerEle.style.height = h +"px";
				// let eee = (coords.height - (evt.clientY - offset.y));
				// console.log(y,h);
				// console.log(top,appEleCoords.height - 50);
				console.log(top,appEleCoords.height);
			}
			*/
		});
		// document.addEventListener("mouseup",(e) => {
		document.addEventListener("touchend",(e) => {
			e.stopPropagation();
			let evt  = e.changedTouches[0];
			if(isDown){
				
				if(evt.clientX == pointerPos.x && evt.clientY == pointerPos.y){
	
					if(e.target.classList.contains("site-player-play-pause")){
						clearTimeout(this.#controlsVisibilityTimer);
						this.#controlsVisibilityTimer = setTimeout(() => this.#playerVideoConEle.classList.add("site-player-controls-hide"),3000);
						this.#togglePlay();
					}else if(e.target.classList.contains("site-palyer-media-setting-btn")){
						this.#mediaSettingModal.show();
					}else if(e.target.classList.contains("site-palyer-collapse-btn")){
						this.#playerEle.classList.add("site-palyer-collapse");
						console.log("collpase");
					}else{
						if(this.#playerEle.classList.contains("site-palyer-collapse")){
							this.#playerEle.classList.remove("site-palyer-collapse");
						}else{
							this.#toggleControls();
						}
					}
					
					// console.log();
				}else{
					console.log("mousemove in up");
				}
				isDown =false;

			}
		});
	
		this.#playerVideoEle.addEventListener('play', (e) => this.#updatePlayButton());
		this.#playerVideoEle.addEventListener('pause',(e) => this.#updatePlayButton());

	}

	#initializeVideo(){
		this.#playerDurationEle.innerHTML = this.#formatTime(Math.round(this.#playerVideoEle.duration));
		this.#playerProgressInput.max = Math.round(this.#playerVideoEle.duration);
	
		this.#playerProgressInput.addEventListener("input",e => {
			e.stopPropagation();
			clearTimeout(this.#controlsVisibilityTimer);
			this.#controlsVisibilityTimer = setTimeout(() => this.#playerVideoConEle.classList.add("site-player-controls-hide"),3000);
			this.#playerVideoEle.currentTime = this.#playerProgressInput.value;
			this.#playerProgressEle.style.setProperty('--progress', Math.round(this.#playerProgressInput.value) / this.#playerVideoEle.duration *100+ "%");
		});
		this.#updateElapsedTime();
		this.#playerVideoEle.addEventListener('loadeddata', () => {
			this.#playerEle.classList.remove("site-player-loading");
		});

		this.#playerVideoEle.addEventListener("progress", () => {
			const duration = this.#playerVideoEle.duration;
			if (duration > 0) {
				for (let i = 0; i < this.#playerVideoEle.buffered.length; i++) {
					if (this.#playerVideoEle.buffered.start(this.#playerVideoEle.buffered.length - 1 - i) < this.#playerVideoEle.currentTime) {
						this.#playerProgressEle.style.setProperty('--buffer', (this.#playerVideoEle.buffered.end(this.#playerVideoEle.buffered.length - 1 - i) * 100) / duration + "%");
						break;
					}
				}
			}
		});

		this.#playerVideoEle.addEventListener('playing', () => {
			console.log("playing")
			this.#playerEle.classList.remove("site-player-loading");
		});
		this.#playerVideoEle.addEventListener('timeupdate', () => this.#updateElapsedTime());
		this.#playerVideoEle.addEventListener('waiting', () => this.#playerEle.classList.add("site-player-loading"));
	}

	#toggleControls(){
		clearTimeout(this.#controlsVisibilityTimer);
		if(this.#playerVideoConEle.classList.contains("site-player-controls-hide")){
			this.#playerVideoConEle.classList.remove("site-player-controls-hide");
			this.#controlsVisibilityTimer = setTimeout(() => this.#playerVideoConEle.classList.add("site-player-controls-hide"),3000)
		}else{
			this.#playerVideoConEle.classList.add("site-player-controls-hide");
		}
	}

	#togglePlay() {
		if (this.#playerVideoEle.paused || this.#playerVideoEle.ended) {
			this.#playerVideoEle.play();
		} else {
			this.#playerVideoEle.pause();
		}
	}

	#updatePlayButton() {
		this.#playerPlayPauseBtn.querySelectorAll("svg").forEach(icon => icon.classList.toggle('site-player-hide'));
		// if (video.paused) {
		//   playButton.setAttribute('data-title', 'Play (k)')
		// } else {
		//   playButton.setAttribute('data-title', 'Pause (k)')
		// }
	}

	#updateElapsedTime(){
		// console.log(this.#playerVideoEle.currentTime);
		this.#playerElapsedTimeEle.innerHTML = this.#formatTime(Math.round(this.#playerVideoEle.currentTime));
		this.#playerProgressInput.value = Math.round(this.#playerVideoEle.currentTime);
		this.#playerProgressEle.style.setProperty('--progress', Math.round(this.#playerVideoEle.currentTime) / this.#playerVideoEle.duration *100+ "%");
		
	}

	#formatTime(sec) {
		const result = new Date(sec * 1000).toISOString();
		if(sec >= 3600){
			return result.substring(11, 19);
		}
		return result.substring(14, 19);
	}


	#addFormMsg(msg, type= "error"){
		return this.#html.addEle({class:["site-form-msg","site-form-msg-"+type],content:msg});
	}

	#isEmpty(str) {
		return !str.trim().length;
	}


}



