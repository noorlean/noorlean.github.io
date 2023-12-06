class TbPlayer{
	#appEle;
	#overlayEle;
	#tabsEle;
	#tabHomeEle;
	#tabRecentEle;
	#tabPlaylistsEle;
	#tabSettingsEle;
	#playerEle;
	#playerViewerEle;
	#db;
	#html;
	#playerVideo;
	#playerItemsEle;
	#pressTimer;
	#isLongPressed = false;
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
		this.#tabRecentEle = document.getElementById("app-tab-recent");
		this.#tabPlaylistsEle = document.getElementById("app-tab-playlists");
		this.#tabSettingsEle = document.getElementById("app-tab-settings");
		this.#playerEle = document.querySelector(".site-player");
		this.#db = db;
		this.#html = new Html();
		
		// const pop2 = new TbModal({
		// 	title:"Add Playlist 22",
		// 	button: this.#html.addButton({class:"xxx",parent:document.body})
		// });
		this.#init();
	}

	#init(){
		this.#ui();
	}

	#ui(){
		this.#playerViewerEle = this.#html.addEle({class:"site-player-viewer",parent:this.#playerEle});
		const playerVideoConEle = this.#html.addEle({class:"site-player-video",parent:this.#playerViewerEle});
		this.#playerVideo = document.createElement("video");
		playerVideoConEle.appendChild(this.#playerVideo);

		this.#playerItemsEle = this.#html.addEle({class:"site-player-items",parent:this.#playerEle});
		this.#recentUi();
		this.updateRecentItems();
		this.updatePlaylistsUi();
	}

	#itemUi(item,opt = {}){
		// const itemEle = this.#html.addEle({class:["site-player-item","ripple"],parent:parent});
		const itemEle = this.#html.addEle({class:"site-player-item"});
		itemEle.dataset.id = "tb-media-"+item.id;
		const itemConEle = this.#html.addEle({class:"site-player-item-con",parent:itemEle});
		const selEle = this.#html.addEle({class:"site-player-item-sel",parent:itemConEle});
		const check = this.#html.addEle({class:"site-check-mark",parent:selEle});
		this.#html.addEle({type:"span",parent:check});

		//<div class="site-check-mark"><span></span></div>
		// const selEleInput = this.#html.addInput({class:"site-player-item-sel-input",type:"checkbox",parent:selEle});
	
		const thumbEle = this.#html.addEle({class:"site-player-item-thumb",parent:itemConEle});
		const thumbImg = document.createElement("img");
		thumbImg.src = item.obj.thumbnail;
		thumbEle.appendChild(thumbImg);

		const itemInfoEle = this.#html.addEle({class:"site-player-item-info",parent:itemConEle});
		const itemTitle = this.#html.addEle({class:"site-player-item-title",parent:itemInfoEle});
		itemTitle.textContent = item.obj.title;
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

		const addPlaylistModal = new TbModal({
			title:"Add Playlist",
			button: openPlaylistFormModal,
			content: addPlaylistModalForm
		});
		
		addPlaylistModalBtn.addEventListener("click", (e) => {
			this.#addPlaylist(addPlaylistModalInput,addPlaylistModalFormMsgs,addPlaylistModal).then(res => {
				setTimeout(() => {
					// console.log(addPlaylistModal)
					this.#overlayEle.style.display = "none";
					addPlaylistModal.close();
					this.#clearSel(this.#tabRecentEle)

				},2000)
			})

			console.log(9999)
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

	updateRecentItems(){
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
				ele.addEventListener('pointerup' , e => this.#itemMouseUp(ele,this.#tabRecentEle));
				// ele.addEventListener('touchstart' , e => this.#itemMouseDown(ele,parent));
				// ele.addEventListener('touchend' , e => this.#itemMouseUp(ele,parent));
				// ele.addEventListener('click' , this.#itemClick);
			});
		})
	}

	updatePlaylistsUi(){
		this.#db.getAll("playlists").then(playlistsObj => {
			//console.log(playlistsObj)
			// data.forEach(obj => {
			// 	this.#itemUi(obj,parent);
			// });
		})
	}

	#itemMouseDown(ele,parent) {
		this.#pressTimer = window.setTimeout(() => this.#longPressed(ele,parent), 500);
		// this.#pressTimer = performance.now();
	};

	#itemMouseUp(ele,parent){
		clearTimeout(this.#pressTimer);
		if(this.#isLongPressed){
			this.#isLongPressed = false;
		}else{
			if(parent.classList.contains("site-player-show-selection")){
				// parent.classList.add("site-player-show-selection");
				ele.classList.toggle("site-player-item-selected");
				this.#enableTools(parent);
			}else{
				console.log('click',ele);
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

	// #openModal(id){
	// 	let modal = document.getElementById(id);
	// 	modal.classList.add("site-popup-show");
	// 	setTimeout(function(){
	// 		modal.classList.add("site-popup-animate");
	// 	},20)
	// }
	
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
						this.#overlayEle.style.display = "flex";
						this.#db.insert("playlists", {
							title : input.value,
						}).then(playlistId => {
							let promises = [];
							this.#tabRecentEle.querySelectorAll(".site-player-item-selected").forEach((sel,selIndex) => {
								if(selIndex == 0){
									const updateMediaObj = this.#db.update("media",parseInt(id), {
										playlist : newPlaylist
									});
								}
								//sel.classList.remove("site-player-item-selected");
								const id = sel.dataset.id.split("tb-media-")[1];
								this.#db.get("media",parseInt(id)).then(dataObj => {
									const newPlaylist = dataObj.playlist.add(playlistId);
									// data.playlist.add(playlistId);
									const updateMediaObj = this.#db.update("media",parseInt(id), {
										playlist : newPlaylist
									});
									promises.push(updateMediaObj);
								});
							});
	
							Promise.all(promises).then(res => {
								resolve();
							});
						})
	
					}
					// console.log(data)
				});
	
			}

			
            
            // Promise.all(promises).then(p => {
            //     resolve(p);
            // })
        })

		
	}








	#addFormMsg(msg, type= "error"){
		return this.#html.addEle({class:["site-form-msg","site-form-msg-"+type],content:msg});
	}

	#isEmpty(str) {
		return !str.trim().length;
	}


}



