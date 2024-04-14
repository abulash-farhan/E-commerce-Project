// variable declaration

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items")
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart 

let cart = [];

// buttons

let buttonsDOM = [];

// getting the products

class Products{
   async getProducts(){
    try{
        let result = await fetch("products.json");
        let data = await result.json();
        let products = data.items;
        // getting property for items from json
        // destructuring the products class
        products = products.map(item=>{
            const {title,price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            // return the clean product destructured class
            return {title,price,id,image};
        });
        return products;
    }
    catch(error){
        console.log(error);
    }
    } 
}
// display the products

class UI{
    displayProducts(products){
        let result = "";
        // this creates a string for every item and acceses them from the products array whuch we created and puts them one by one into it
        products.forEach(product => {
            // result is a string which would store all the items one by one // item card
            result += `
            <article class="product">
                        <div class="img-container">
                            <img src=${product.image} 
                            alt="product" 
                            class="product-img">
                            <button class="bag-btn" data-id=${product.id}>
                                <i class="fas fa-shopping-cart"></i>
                                Add to Cart
                            </button>
                        </div>
                        <h3>${product.title}</h3>
                        <h4>$${product.price}</h4>
                    </article>`;
        });
        // this displays the products into the parent container that we created
        productsDOM.innerHTML = result;
    }
    getBagButtons(){
        // converts the nodelist of buttons to an array
        const buttons = [...document.querySelectorAll(".bag-btn")] // all add to cart buttons selected
        buttonsDOM = buttons; // buttons array
        // iterating over array of buttons
        buttons.forEach(button =>{
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id) // checking if item is already in the cart[] array by matching id
            if(inCart){
                button.innerText = "In Cart"
                button.disabled = true;
            }
            
        button.addEventListener("click", (e)=>{
                    e.target.innerText = "In Cart";
                    e.target.disabled = true;
                    // get product from products 
                    let cartItem = {...Storage.getProduct(id), amount : 1}; // using spread operator to destructure the elements

                    // add product to the cart
                    cart = [...cart,cartItem];

                    // save the cart in local storage

                    Storage.saveCart(cart);

                    // set cart value

                    this.setCartValues(cart);

                    // display cart item

                    this.addCartItem(cartItem);
                    // show the cart

                    this.showCart();
                })
        
        })
    }
    setCartValues(cart){
        let tempTotal=0;
        let itemTotal=0;
        cart.map(item=>{
            tempTotal += item.price * item.amount;
            itemTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemTotal;
        // console.log(tempTotal,itemTotal);
    }
    addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<!-- cart item -->
            <!-- item image -->
            <img src=${item.image} alt="product" />
            <!-- item info -->
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <!-- item functionality -->
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">
                ${item.amount}
              </p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>
          <!-- cart item -->
    `;
    cartContent.appendChild(div);
  }
    showCart(){
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    
    setupApp(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click",this.showCart);
        closeCartBtn.addEventListener("click",this.hideCart);
    }
    populateCart(){
        cart.forEach(item => this.addCartItem(item));

    }
    hideCart(){
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic(){
        // clearCartBtn.addEventListener("click",this.clearCart)  this is incorrect as this will point to button and not UI class
        clearCartBtn.addEventListener("click",()=>{
            this.clearCart();
        })
         // cart functionlity
         cartContent.addEventListener("click",event =>{
            if(event.target.classList.contains("remove-item")){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                //removal from dom
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id); // remmoval from cart
            }
            else if(event.target.classList.contains("fa-chevron-up")){
                let addAmount = event .target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item=>item.id===id);
                tempItem.amount=tempItem.amount+1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText=tempItem.amount;

            }
             else if(event.target.classList.contains("fa-chevron-down")){
        
                let deductAmount = event.target;
                let id = deductAmount.dataset.id;
                let tempItem = cart.find(item=>item.id===id);
                tempItem.amount = tempItem.amount-1;
                if(tempItem.amount>0){
                     Storage.saveCart(cart);
                     this.setCartValues(cart);
                     deductAmount.previousElementSibling.innerText=tempItem.amount;
                }
                
                else{
                    cartContent.removeChild(deductAmount.parentElement.parentElement)
                    this.removeItem(id)
                }
            }
         })

    }
    clearCart() {
    cart = [];
    this.setCartValues(cart);
    Storage.saveCart(cart);
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach(button => {
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to bag`;
    });
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

    removeItem(id){
        cart = cart.filter(item => item.id !==id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class ="fas fa-shopping-cart"</i>Add to cart`;
    }
    getSingleButton(){
        return buttonsDOM.find(button=>button.dataset.id===id);

    }
}

// local storage

class Storage{
    static saveProduct(products){
        localStorage.setItem("product", JSON.stringify(products))
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"));
        //find for the particular product with the id passed from products in local storage and return
        return products.find(products=>products.id ===id)

    }
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));

    }
    static getCart(){
        return localStorage.getItem("cart")? JSON.parse(localStorage.getItem("cart")):[];
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI();
    const products = new Products();
    //setupApplication
    ui.setupApp();

    // get all products
    products.getProducts()
    .then(products =>{
        ui.displayProducts(products);
        Storage.saveProduct(products);
    })
    .then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
})

