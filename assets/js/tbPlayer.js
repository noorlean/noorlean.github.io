
//downalod - share - popup - autoplay next 
class TbPlayer{
	#globalStyle;
	#appEle;
	#settings;
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
	#playerCollapseBtn;
	#playerCloseBtn;
	#playerItemTitle;
	#playerItemTitleS;
	#playerItemsListEle;
	#currentPlayingMediaId = null;
	#currentPlaylist = null;
	#db;
	#html;
	#pressTimer;
	#controlsVisibilityTimer;
	#isLongPressed = false;
	#mediaSettingModal;
	#isPointerDown = false;
	#isPointerDownMoved = false;
	#pointer;
	constructor(sel,db,settings){
		if (typeof sel == "object"){
			this.#appEle = sel;
		}else if (typeof sel == "string"){
			this.#appEle = document.querySelector(sel);
		}
		this.#settings = settings;
		this.#globalStyle = document.querySelector("#global-style");
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
		this.#playerMediaSettingsBtn = this.#playerEle.querySelector(".site-player-media-setting-btn");
		this.#playerPlayPauseBtn = this.#playerEle.querySelector(".site-player-play-pause");
		this.#playerProgressEle = this.#playerEle.querySelector(".site-player-progressbar");
		this.#playerProgressInput = this.#playerProgressEle.querySelector("input");
		this.#playerElapsedTimeEle = this.#playerEle.querySelector(".site-player-elapsed-time");
		this.#playerDurationEle = this.#playerEle.querySelector(".site-player-duration");
		this.#playerFullscreenBtn = this.#playerEle.querySelector(".site-player-fullscreen");
		this.#playerCollapseBtn = this.#playerEle.querySelector(".site-player-collapse-btn");
		this.#playerCloseBtn = this.#playerEle.querySelector(".site-player-close-btn");

		this.#playerItemTitle = this.#playerEle.querySelector(".site-player-media-title");
		this.#playerItemTitleS = this.#playerEle.querySelector(".site-player-media-title-s");
		this.#playerItemsListEle = this.#playerEle.querySelector(".site-player-list-items");
		this.#db = db;
		this.#html = new Html();
		this.#pointer = {down:"touchstart",move:"touchmove",up:"touchend"};
		if(/Mobi/i.test(window.navigator.userAgent) == false){
			this.#pointer = {down:"mousedown",move:"mousemove",up:"mouseup"};
		}
		
		// const pop2 = new TbModal({
		// 	title:"Add Playlist 22",
		// 	button: this.#html.addButton({class:"xxx",parent:document.body})
		// });
		this.#init();
	}

	#getPointerEvent(e){
		if(/Mobi/i.test(window.navigator.userAgent)){
			return e.changedTouches[0];
		}
		return e;
	}

	#init(){
		this.#recentUi();
		this.#playlistsUi();
		this.#updateRecentItems();
		this.updatePlaylistItems();
		this.#playerUi();

	}

	// #itemUi(item, type = "media",palylist = null){
	#itemUi(item,opt = {}){
		let optArr = Object.keys(opt);
        let defaults = {
            type :"media",
            palylist: null
        }
        if(optArr.length){
            optArr.forEach((o,i) => {
                defaults[o] = opt[o];
            });
        }

		// const itemEle = this.#html.addEle({class:["site-player-item","ripple"],parent:parent});
		const itemEle = this.#html.addEle({class:"site-player-item"});
		itemEle.dataset.id = item.id;
		if(defaults["palylist"]){
			itemEle.dataset.playlist = defaults["palylist"];
		}
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
		if(defaults["type"] == "playlist"){
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
					addPlaylistModalInput.value = "";
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
	#updateRecentItems(){
		const listItemsEle = this.#tabRecentEle.querySelector(".site-list-items");
		listItemsEle.innerHTML = "";
		// this.#tabRecentEle
		this.#db.getAll("media").then(data => {
			data.forEach(obj => {
				const ele = this.#itemUi(obj,{
					palylist:"recent"
				});
				listItemsEle.prepend(ele);

				// ele.addEventListener('pointerdown' , e => {
				// 	console.log(e.pointerType)
				// });
				
				ele.addEventListener(this.#pointer.down , e => this.#itemPointerDown(ele,this.#tabRecentEle));
				ele.addEventListener(this.#pointer.move , e => this.#itemPointerMove(this.#getPointerEvent(e)));
				ele.addEventListener(this.#pointer.up , e => this.#itemPointerUp(ele,obj,this.#tabRecentEle));

				// ele.addEventListener('touchstart' , e => this.#itemPointerDown(ele,this.#tabRecentEle));
				// ele.addEventListener('touchmove' , e => this.#itemPointerMove(e.changedTouches[0]));
				// ele.addEventListener('touchend' , e => this.#itemPointerUp(ele,obj,this.#tabRecentEle));

				// ele.addEventListener('touchstart' , e => this.#itemPointerDown(ele,parent));
				// ele.addEventListener('touchend' , e => this.#itemPointerUp(ele,parent));
				// ele.addEventListener('click' , this.#itemClick);
			});
		})
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

	updatePlaylistItems(){
		const listItemsEle = this.#tabPlaylistsEle.querySelector(".site-list-items");
		listItemsEle.innerHTML = "";
		// this.#tabRecentEle
		this.#db.getAll("playlists").then(data => {
			data.forEach(obj => {
				const ele = this.#itemUi(obj,{
					type:"playlist"
				});
				listItemsEle.prepend(ele);
				// ele.addEventListener('pointerdown' , e => this.#itemPointerDown(ele,this.#tabPlaylistsEle));
				// ele.addEventListener('pointerup' , e => this.#itemPointerUp(ele,this.#tabPlaylistsEle));
				// ele.addEventListener('touchstart' , e => this.#itemPointerDown(ele,parent));
				// ele.addEventListener('touchend' , e => this.#itemPointerUp(ele,parent));
				// ele.addEventListener('click' , this.#itemClick);
			});
		})
	}

	#updateModalPlaylistsItems(modalCon){
		modalCon.innerHTML = "";
		// this.#tabRecentEle
		this.#db.getAll("playlists").then(data => {
			if(data.length){
				const con = this.#html.addEle({class:"site-modal-playlists-con",parent:modalCon});
				this.#html.addEle({class:"site-popup-title",parent:con,content:"Current Playlists"});
				const list = this.#html.addEle({class:"site-modal-playlists-items",parent:con});
				data.forEach(obj => {
					const ele = this.#itemUi(obj,{
						type:"playlist"
					});
					list.prepend(ele);
					// ele.addEventListener('pointerdown' , e => this.#itemPointerDown(ele,this.#tabPlaylistsEle));
					// ele.addEventListener('pointerup' , e => this.#itemPointerUp(ele,this.#tabPlaylistsEle));
					// ele.addEventListener('touchstart' , e => this.#itemPointerDown(ele,parent));
					// ele.addEventListener('touchend' , e => this.#itemPointerUp(ele,parent));
					// ele.addEventListener('click' , this.#itemClick);
				});

			}
		})
	}

	#itemPointerDown(ele,parent) {
		this.#isPointerDownMoved = false;
		this.#isPointerDown = true;
		this.#pressTimer = window.setTimeout(() => this.#longPressed(ele,parent), 500);
		// this.#pressTimer = performance.now();
	};
	#itemPointerMove(e) {
		if(this.#isPointerDown){
			this.#isPointerDownMoved = true;
		}
		// this.#pressTimer = performance.now();
	};

	#itemPointerUp(ele,obj,parent){
		clearTimeout(this.#pressTimer);
		if(this.#isLongPressed){
			this.#isLongPressed = false;
		}else{
			if(parent.classList.contains("site-player-show-selection")){
				// parent.classList.add("site-player-show-selection");
				ele.classList.toggle("site-player-item-selected");
				this.#enableTools(parent);
			}else{
				this.#playVideo(obj,ele);
				//open player videio
			}
		}
		this.#isPointerDown = false;
		this.#isPointerDownMoved = false;
	};
	
	#longPressed(ele,parent){
		if(!this.#isPointerDownMoved){
			this.#isLongPressed = true;
			if(!parent.classList.contains("site-player-show-selection")){
				parent.classList.add("site-player-show-selection");
				ele.classList.add("site-player-item-selected");
				this.#enableTools(parent);
			}
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

	/**PLAYER FUNCS**/
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
			button: this.#playerMediaSettingsBtn,
			content: mediaSettingModalCon
		});

		// this.#playerProgressEle.addEventListener("click",e => {
		// 	e.stopPropagation();
		// 	clearTimeout(this.#controlsVisibilityTimer);
		// 	this.#controlsVisibilityTimer = setTimeout(() => this.#playerVideoConEle.classList.add("site-player-controls-hide"),3000);
		// });
		this.#playerVideoEle.addEventListener('loadedmetadata',(e) => this.#initializeVideo());
		this.#playerPlayPauseBtn.addEventListener("click",(e) => {
			e.stopPropagation();
			clearTimeout(this.#controlsVisibilityTimer);
			this.#controlsVisibilityTimer = setTimeout(() => this.#playerVideoConEle.classList.add("site-player-controls-hide"),3000);
			this.#togglePlay();
		});

		this.#playerCollapseBtn.addEventListener("click",(e) => {
			e.stopPropagation();
			this.#playerEle.classList.add("site-player-collapse");
			setTimeout(() => {
				this.#playerEle.classList.add("site-player-collapse-animate");
			},100)
		});

		this.#playerCloseBtn.addEventListener("click",(e) => {
			e.stopPropagation();
			this.#playerEle.classList.add("site-player-close");
			setTimeout(() => {
				this.#playerVideoEle.src = "";
				this.#currentPlaylist = null;
				this.#currentPlayingMediaId = null;
				this.#resetPlayer();
				this.#playerEle.classList.remove("site-player-show");
				this.#playerEle.classList.remove("site-player-collapse");
				this.#playerEle.classList.remove("site-player-collapse-animate");
				setTimeout(() => {
					this.#playerEle.classList.remove("site-player-close");
				},100);
			},500)
		});

		this.#playerVideoConEle.addEventListener("click",(e) => {
			e.stopPropagation();
			if(this.#playerEle.classList.contains("site-player-collapse")){
				this.#playerEle.classList.remove("site-player-collapse-animate")
				setTimeout(() => {
					this.#playerEle.classList.remove("site-player-collapse");
				},100);
			}else{
				this.#toggleControls();
			}
		});
	
		this.#playerVideoEle.addEventListener('play', (e) => this.#updatePlayButton());
		this.#playerVideoEle.addEventListener('pause',(e) => this.#updatePlayButton());
		this.#playerVideoEle.addEventListener('ended',(e) => {
			if(this.#settings.defaults.autoplay){
				const current = this.#playerItemsListEle.querySelector(".site-player-item-active");
				if(current.nextElementSibling){
					const id = parseInt(current.nextElementSibling.dataset.id);
					this.#db.get("media",id).then(media => {
						console.log(media);
						// this.#playVideo(media,current.nextElementSibling);
					});
				}
			}
		});
		this.#playerVideoEle.addEventListener('error',(e) => {
			console.log("errrorrrrr")
		});

	}

	#updatePlayerListItems(playlistId = null,id){
		return new Promise((resolve) => {
			let current = null;
			this.#playerItemsListEle.innerHTML = "";
			// this.#tabRecentEle
			if(playlistId && typeof playlistId == "number"){
				this.#db.get("playlists",playlistId).then(pl => {
					console.log(pl);

				});
			}else{
				this.#db.getAll("media").then(data => {
					data.forEach(obj => {
						const ele = this.#itemUi(obj);
						if(obj.id == id){
							current = ele;
						}
						this.#playerItemsListEle.prepend(ele);
						ele.addEventListener('click' , (e) => this.#playVideo(obj,ele));
	
					});
					resolve(current);
				});
	
			}
			
		})

		//scroll to list item
	}

	#playVideo(obj,ele){
		// console.log(this.#settings.defaults.autoplay)
		console.log(obj)
		if(!this.#playerEle.classList.contains("site-player-show")){
			this.#playerEle.classList.add("site-player-show");
		}
		
		if(this.#playerEle.classList.contains("site-player-collapse") && this.#playerEle.classList.contains("site-player-collapse-animate")){
			this.#playerEle.classList.remove("site-player-collapse-animate")
			setTimeout(() => {
				this.#playerEle.classList.remove("site-player-collapse");
			},100);
		}

		if(ele.dataset.playlist){
			if(this.#currentPlaylist !== ele.dataset.playlist){
				this.#updatePlayerListItems(ele.dataset.playlist,obj.id).then(activeEle => {
					if(activeEle){
						activeEle.classList.add("site-player-item-active");
						// this.#scrollTo(activeEle).then((to) => {
						// })
					}
				})
				this.#currentPlaylist = ele.dataset.playlist;
			}
		}

		if(this.#currentPlayingMediaId  !== obj.id){
			this.#playerEle.classList.add("site-player-loading");
			this.#playerItemTitle.textContent = obj.title;
			this.#playerItemTitleS.textContent = obj.title;
			this.#resetPlayer();
			// this.#addStyle(obj.id);
			this.#setActiveItem(obj.id);
			const now = new Date().getTime() / 1000;
			if(now < obj.expire){
				// console.log("not expired",now)
				// const firstFormat =  Object.values(obj.streamingData.formats).filter(f => f.quality == "medium");
				this.#playerVideoEle.src = obj.streamingData.formats[0].url;
				this.#updateMediaSettingsUi(obj);
			}else{
				this.#fetchUrl(obj.url).then(res => {
					const streamingData = res.data.streamingData;
					this.#db.update("media",obj.id, {
						streamingData : streamingData,
						expire : parseInt(streamingData.expiresInSeconds) + now
					}).then(r => {
						this.#updateRecentItems();
						this.#playerVideoEle.src = streamingData.formats[0].url;
						this.#updateMediaSettingsUi(res.data);
					});
	
				}).catch(err => {
					console.log(err)
				})
			}
			this.#currentPlayingMediaId = obj.id;
			
		}
		/*
		const firstFormat =  Object.values(obj.formats).filter(f => f.quality == "medium");
		this.#playerVideoEle.src = obj.formats[0].url;
		this.#playerEle.classList.add("site-player-show");
		console.log(obj)
		*/
	}

	#setActiveItem(id){
		this.#appEle.querySelectorAll(".site-player-item").forEach(pi => {
			if(pi.dataset.id == id){
				pi.classList.add("site-player-item-active");
				// this.#scrollTo(pi)
			}else{
				pi.classList.remove("site-player-item-active");
			}
		})
	}

	#updateMediaSettingsUi(obj){
		// const formats = [...obj.streamingData.formats,...obj.streamingData.adaptiveFormats];
		// const filteredFormats = formats.filter(format => Boolean(format.audioQuality))

		//this.#mediaSettingModalQualitySelect

		this.#mediaSettingModalQualitySelect.innerHTML = "";
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

	#resetPlayer(){
		this.#playerProgressInput.value = 0;
		this.#playerElapsedTimeEle.innerHTML = "00:00";
		this.#playerDurationEle.innerHTML = "00:00";
		this.#playerPlayPauseBtn.querySelector(".site-player-play").classList.remove('site-player-hide');
		this.#playerPlayPauseBtn.querySelector(".site-player-pause").classList.add('site-player-hide');
		this.#playerVideoConEle.style.setProperty('--progress',"0%");
		this.#playerVideoConEle.style.setProperty('--buffer',"0%");
	}

	#initializeVideo(){
		this.#playerDurationEle.innerHTML = this.#formatTime(Math.round(this.#playerVideoEle.duration));
		this.#playerProgressInput.max = Math.round(this.#playerVideoEle.duration);
	
		this.#playerProgressInput.addEventListener("input",e => {
			// e.stopPropagation();
			clearTimeout(this.#controlsVisibilityTimer);
			this.#controlsVisibilityTimer = setTimeout(() => this.#playerVideoConEle.classList.add("site-player-controls-hide"),3000);
			if(this.#playerProgressInput.value < this.#playerVideoEle.duration){
				this.#playerVideoEle.currentTime = this.#playerProgressInput.value;
				this.#playerVideoConEle.style.setProperty('--progress', Math.round(this.#playerProgressInput.value) / this.#playerVideoEle.duration *100+ "%");
			}
			// else{
			// 	this.#playerVideoEle.currentTime = this.#playerProgressInput.value-1;
			// 	this.#playerVideoConEle.style.setProperty('--progress', Math.round(this.#playerProgressInput.value-1) / this.#playerVideoEle.duration *100+ "%");

			// }
		});

		let sliderPointerDown = false;
		let isMediaPlaying = false;

		this.#playerProgressInput.addEventListener(this.#pointer.down,e => {
			sliderPointerDown = true;
			if (!this.#playerVideoEle.paused) {
				isMediaPlaying = true;
			}
			this.#playerVideoEle.pause();
		});

		this.#playerEle.addEventListener(this.#pointer.up, e => {
			if(sliderPointerDown){
				if(isMediaPlaying){
					this.#playerVideoEle.play();
					isMediaPlaying = false;
				}
				sliderPointerDown = false;
			}
		})
		
		this.#updateElapsedTime();
		this.#playerVideoEle.addEventListener('loadeddata', () => {
			this.#playerEle.classList.remove("site-player-loading");
		});

		this.#playerVideoEle.addEventListener("progress", () => {
			const duration = this.#playerVideoEle.duration;
			if (duration > 0) {
				for (let i = 0; i < this.#playerVideoEle.buffered.length; i++) {
					if (this.#playerVideoEle.buffered.start(this.#playerVideoEle.buffered.length - 1 - i) < this.#playerVideoEle.currentTime) {
						this.#playerVideoConEle.style.setProperty('--buffer', (this.#playerVideoEle.buffered.end(this.#playerVideoEle.buffered.length - 1 - i) * 100) / duration + "%");
						break;
					}
				}
			}
		});

		this.#playerVideoEle.addEventListener('playing', () => {
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
		this.#playerVideoConEle.style.setProperty('--progress', Math.round(this.#playerVideoEle.currentTime) / this.#playerVideoEle.duration *100+ "%");
		
	}

	#formatTime(sec) {
		const result = new Date(sec * 1000).toISOString();
		if(sec >= 3600){
			return result.substring(11, 19);
		}
		return result.substring(14, 19);
	}

	/**GENERAL FUNCS**/
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
					fetch("https://masmas2008.us.to/?id="+urlInfo.id+"&type="+urlInfo.type)
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

	#canPlay(url) {
		return new Promise((resolve) => {
			let xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.onreadystatechange = function () {
				resolve(xhr.status)
			}
			xhr.send();
		})
	}

	#addFormMsg(msg, type= "error"){
		return this.#html.addEle({class:["site-form-msg","site-form-msg-"+type],content:msg});
	}

	#isEmpty(str) {
		return !str.trim().length;
	}

	#addStyle(id){
		this.#globalStyle.innerHTML = "";
		const style = document.createElement("style")
		style.textContent = '[data-id="'+id+'"] { background-color: red; }';
		this.#globalStyle.appendChild(style);
	}

	#scrollTo(to) {
		// console.log(to)
		return new Promise(resolve => {
			const con = to.parentNode;
			const conTop = con.getBoundingClientRect().top;
			const toTop = to.getBoundingClientRect().top;
			const fixedOffset = toTop - conTop;
			const onScroll = (e) => {
				if (con.scrollTop == fixedOffset) {
					con.removeEventListener('scroll', onScroll)
					resolve();
				}
			}
			con.addEventListener('scroll', onScroll)
			onScroll();
			con.scrollTo({
				top: fixedOffset,
				behavior: 'smooth',
			})
		})
	}


}



