"use strict"

document.body.oncontextmenu = (event) => {
   event.preventDefault();
   event.stopPropagation();
}

const methods = {

   init() {
      console.log(123);
   },
}

export default methods;