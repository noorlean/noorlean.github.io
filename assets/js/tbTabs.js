class TbTabs{
	#ele;
	#headerItems;
	#bodyItems;
	constructor(sel){
		if (typeof sel == "object"){
			this.#ele = sel;
		}else if (typeof sel == "string"){
			this.#ele = document.querySelector(sel);
		}
		this.#init();
	}
	#init(){
		this.#headerItems = this.#ele.querySelectorAll(".site-tabs-item-btn");
		this.#bodyItems = this.#ele.querySelectorAll(".site-tabs-item");
		this.#ele.querySelectorAll(".site-tabs-item-btn").forEach((headerEle,index) => {
			headerEle.addEventListener("click", e => {
				this.#bodyItems.forEach((bodyEle) => {
					bodyEle.classList.remove("site-tabs-item-active");
				});
				this.#bodyItems[index].classList.add("site-tabs-item-active");
			});
		});	
	}
}