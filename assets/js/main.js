window.history.pushState(null, null, window.location.href);
		window.onpopstate = function () {
			// console.log(8787)

			// window.history.go(1);
		};
		let fromShare = false;
		new TbDb("tb-media-db",[
			{
				name:"media",
				key: { keyPath: 'id', autoIncrement:true },
				cols:{
					title : { unique: false },
					type : { unique: false },
					thumbnail : { unique: false },
					// videoId : { unique: false },
					expire : { unique: false },
					url : { unique: false },
					streamingData : { unique: false }
				}
			},{
				name:"playlists",
				key: { keyPath: 'id', autoIncrement:true },
				cols:{
					title : { unique: false },
					thumbnail : { unique: false },
					items : { unique: false },
				}
			},{
				name:"settings",
				key: { keyPath: 'id', autoIncrement:true },
				cols:{
					name : { unique: false },
					value : { unique: true },
				},
			}
		],2).then(db => {
			let settings = {};
			const appEle = document.getElementById("tb-local-media");
			db.getAll("settings").then(data => {
				if(data.length){
					data.forEach(s => {
						settings[s.name] = s.value;
					})
					const player = new TbPlayer(appEle,db,settings);
				}else{
					const defaults = [
						{
							name : "defaults",
							value : { deafultQuality: "360","autoplay":true },
						}
					]
					defaults.forEach(s => {
						settings[s.name] = s.value;
						db.insert("settings", s).then(id => {
							// console.log(id)
						})
					})
					const player = new TbPlayer(appEle,db,settings);
					
				}
			});

			// const mediaUrlInput = document.getElementById("site-media-url-input");
			// const mediaGetBtn = document.getElementById("site-media-get-btn");
			
			if(fromShare){

			}else{
				//hide overlay
				document.querySelector(".overlay").style.display = "none";

			}

			/*
			mediaGetBtn.addEventListener("click",(e) => {
				let urlInfo = null;
				const url = mediaUrlInput.value;
				if(url && isValidUrl(url)){
					let regxYoutube =  /^(?:http(?:s)?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user|shorts)\/))([^\?&\"'>]+)/;
					if(url.match(regxYoutube)){
						urlInfo = {id:url.match(regxYoutube)[1],type:"youtube"};
					}

					if(urlInfo){
						// https://www.youtube.com/watch?v=7Nvrqa6CmjE
						// fetch("http://localhost/php/?id="+urlInfo.id+"&type="+urlInfo.type)
						// fetch("http://localhost/php/?id=https://www.youtube.com/watch?v=_ZvnD73m40o")
						// fetch("http://localhost/php/?id=https://www.youtube.com/watch?v=Dorf8i6lCuk")
						// fetch("http://localhost/php/?id=https://www.youtube.com/watch?v=YA0KB2DPJms")
						// fetch("http://localhost/php/?id=Dorf8i6lCuk&type=youtube")
						// fetch("http://localhost/php/?id=YA0KB2DPJms&type=youtube")
						fetch("http://localhost/php/?id=_ZvnD73m40o&type=youtube")
						.then(res => res.text())
						.then(text =>{
							const jsonObj = JSON.parse(text);
							console.log(jsonObj)
							const streamingData = jsonObj.streamingData;
							const videoDetails = jsonObj.videoDetails;
							const obj = {
								title : videoDetails.title,
								type : urlInfo.type,
								thumbnail : videoDetails.thumbnail.thumbnails[0].url,
								videoId : videoDetails.videoId,
								expire : streamingData.expiresInSeconds,
								formats : {...streamingData.adaptiveFormats,...streamingData.formats},
							};

							db.insert("media", obj).then(res => {
								player.updateRecentItems();
							})

							// console.log(jsonObj);
							// console.log(obj);

							// console.log(jsonObj.streamingData)
						});

					}
					

				}else{
					console.log("Please insert vaild URL.")
				}
			});
			*/

			// player.addItems(db);


			/*
			add.onclick =  () =>{
				db.insert("media", {
					type : "youtube",
					obj : { formates: 85 },
					playlist : ["quran"]
				})

			}
			update.onclick =  () =>{
				db.update("media",1, {
					type : "instagram",
					obj : { formates: 9999 },
					playlist : ["isalmic"]
				})

			}


			getAll.onclick =  () =>{
				db.getAll("media").then(data => {
					console.log(data)

				})
			}
			get.onclick =  () =>{
				db.get("media",1).then(data => {
					console.log(data)
				});
			}

			del.onclick = () =>{
				db.delete("media",1).then(data => {
					console.log(data)
				})
			}
			*/

		})

	
        // document.querySelector("#add-playlist-btn").addEventListener("click",(e) => {
		// 	e.preventDefault();
		// 	let modal = document.getElementById("site-popup-playlist");
        //     modal.classList.add("site-popup-show");
        //     setTimeout(function(){
        //         modal.classList.add("site-popup-animate");
        //     },20)
        // });

		// document.querySelectorAll(".site-popup-close").forEach(btn => {
		// 	btn.addEventListener("click",(e) => {
		// 		e.preventDefault();
		// 		let modal = btn.parentNode.parentNode;
		// 		modal.classList.remove("site-popup-animate");
		// 		setTimeout(function(){
		// 			modal.classList.remove("site-popup-show");
		// 		},400);
		// 	});

		// })

		