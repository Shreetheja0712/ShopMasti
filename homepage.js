const fun1=()=>{
   bar.innerHTML=`<div id=special>
            <div><h4>
              Programmes&Features
            </h1></div>
            <div>Settings</div>
            <div>Help</div>
   </div>
   `
}
let bar=document.querySelector(".menu-btn");
bar.addEventListener("mouseenter",fun1);
bar.removeEventListener("mouseleave",fun1);
