class TbModal{
	#popupEle;
	#html;
	#popupBodyEle;
	#defaults;
	constructor(opt = {}){
		let optArr = Object.keys(opt);
		this.#defaults = {
            title :"",
            button:null,
            content:null,
            closeBtn:true,
        }
        if(optArr.length){
            optArr.forEach((o,i) => {
                this.#defaults[o] = opt[o];
            });
        }
		this.#html = new Html();
		this.#popupEle = this.#html.addEle({class:"site-popup",parent:document.body,});
		this.ele = this.#popupEle;
		this.#init();
		// return this.#popupEle;
	}
	#init(){
		this.#buildUI();
	}

	#buildUI(){
		const popupEleCon = this.#html.addEle({class:"site-popup-con",parent:this.#popupEle});
		if(this.#defaults['closeBtn']){
			const closeBtn = this.#html.addEle({class:"site-popup-close",parent:popupEleCon});
			closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 96 960 960" width="48"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"></path></svg>';
			closeBtn.addEventListener("click", (e) => {
				this.close();
			});
		}

		if(this.#defaults['title'].trim()){
			this.#html.addEle({class:"site-popup-header",parent:popupEleCon,content:"<h2>"+this.#defaults['title']+"</h2>"});
		}
		this.#popupBodyEle = this.#html.addEle({class:"site-popup-body",parent:popupEleCon});
		this.#popupEle.addEventListener("click", (e) => {
			this.close();
		});
		
		popupEleCon.addEventListener("click", (e) => {
			e.stopPropagation();
		});
		
		if(this.#defaults['button'] && this.#isElement(this.#defaults['button'])){
			this.#defaults['button'].addEventListener("click", (e) => {
				this.show();
			});
		}
		if(this.#defaults['content']  && this.#isElement(this.#defaults['content'])){
			this.#popupBodyEle.appendChild(this.#defaults['content']);
		}
	}

	#isElement(element) {
		return element instanceof Element || element instanceof HTMLDocument;  
	}

	addContent(htmlEle){
		if(this.#isElement(htmlEle)){
			this.#popupBodyEle.appendChild(htmlEle);
		}
	}

	addButton(htmlEle){
		if(this.#isElement(htmlEle)){
			htmlEle.addEventListener("click", (e) => {
				this.#popupEle.classList.add("site-popup-show");
				setTimeout(() => {
					this.#popupEle.classList.add("site-popup-animate");
				},20)
			});
		}
	}

	close(){
		this.#popupEle.classList.remove("site-popup-animate");
		setTimeout(() => {
			this.#popupEle.classList.remove("site-popup-show");
		},400);
	}
	show(){
		this.#popupEle.classList.add("site-popup-show");
		setTimeout(() => {
			this.#popupEle.classList.add("site-popup-animate");
		},20);
	}
}