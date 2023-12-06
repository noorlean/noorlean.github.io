//HTML Class
class Html{
	addLabel(lbText = "Label"){
        let lb = document.createElement("label");
        let lbSpan = document.createElement("span");
        lbSpan.textContent = lbText;
        lb.appendChild(lbSpan);
        return lb;
    }

    addInput(opt = {}){
        let ic = null;
        let lb = null;
        let inputTypesArr = ["text","number","email","checkbox","radio"];
        let optArr = Object.keys(opt);
        let defaults = {
            placeholder :"",
            type :"text",
            class :"",
            parent: null,
            label: null,
            selected: null,
            options: null
        }
        if(optArr.length){
            optArr.forEach((o,i) => {
                defaults[o] = opt[o];
            });
        }
        if(inputTypesArr.includes(defaults["type"])){
            ic = document.createElement("input");
            ic.setAttribute("type",defaults["type"]);
        }else{
            if(defaults["type"] == "textarea"){
                ic = document.createElement("textarea");
            }else if(defaults["type"] == "select"){
                ic = document.createElement("select");
                if(defaults["options"]){
                    Object.keys(defaults["options"]).forEach((o) => {
                        if(defaults["selected"] && defaults["selected"] == o){
                            ic.add(new Option(defaults["options"][o], o,false,true));
                        }else{
                            ic.add(new Option(defaults["options"][o], o));
                        }
                    })
                }
            }
        }

        if(defaults['class'] !== ""){
            if(typeof defaults['class'] == 'string'){
                ic.classList.add(defaults['class']);
            }
            if(Array.isArray(defaults['class'])){
                typeof defaults['class'].forEach(cls =>{
                    ic.classList.add(cls);
                });
            }
        }

        if(defaults["placeholder"] && typeof defaults['placeholder'] == 'string'){
           ic.setAttribute("placeholder",defaults["placeholder"]);
        }

        if(defaults["label"] && typeof defaults['label'] == 'string'){
            lb = this.addLabel(defaults["label"]);
            lb.appendChild(ic)
        }

        if(defaults["parent"]){
            if(lb){
                defaults["parent"].appendChild(lb)
            }else{
                defaults["parent"].appendChild(ic)
            }
        }
        return ic;
    }

    addButton(opt = {}){
        let optArr = Object.keys(opt);
        let defaults = {
            text :"Button",
            class :"",
            style :"",
            id :"",
            parent: null
        }
        if(optArr.length){
            optArr.forEach((o,i) => {
                defaults[o] = opt[o];
            });
        }
        let btn = document.createElement("button");
        btn.innerHTML = defaults['text'];
        if(defaults['class'] !== ""){
            if(typeof defaults['class'] == 'string'){
                btn.classList.add(defaults['class']);
            }
            if(Array.isArray(defaults['class'])){
                typeof defaults['class'].forEach(cls =>{
                    btn.classList.add(cls);
                });
            }
        }
        if(defaults['id'] && typeof defaults['id'] == 'string'){
            btn.setAttribute("id",defaults['id']);
        }

        if(defaults["parent"]){
            defaults["parent"].appendChild(btn)
        }
        return btn;
    }

    addEle(opt = {}){
        let optArr = Object.keys(opt);
        let defaults = {
            id :"",
            class :"",
            type :"div",
            parent: null,
            content: "",
        }
        if(optArr.length){
            optArr.forEach((o,i) => {
                defaults[o] = opt[o];
            });
        };
        let ele = document.createElement(defaults["type"]);
        if(defaults["id"] !== ""){
            ele.setAttribute("id",defaults["id"]);
        }
        if(defaults["content"] !== ""){
            ele.innerHTML = defaults["content"];
        }
        if(defaults['class'] !== ""){
            if(typeof defaults['class'] == 'string'){
                ele.classList.add(defaults['class']);
            }
            if(Array.isArray(defaults['class'])){
                typeof defaults['class'].forEach(cls =>{
                    ele.classList.add(cls);
                });
            }
        }
        if(defaults["parent"]){
            defaults["parent"].appendChild(ele)
        }
        return ele;
    }
}