// Carga JSON Productos
const loadJson = async url => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al cargar el archivo JSON:', error);
        return null;
    }
};

// Constantes getElementById
const productGrid = document.getElementById('product-grid');
const cartIcon = document.getElementById('cart');
const cart = document.getElementById('cart-module');
const mainElement = document.getElementById('main');
const closeButton = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const buttonCart = document.getElementById('cart-button');
const productDetailElement = document.getElementById('product-detail');
const modalElement = document.getElementById('modal');
const overlayElement = document.getElementById('overlay');
const messageElement = document.getElementById('message');

const cartProducts = [];

const showNotification = (message, isError = false) => {
    messageElement.textContent = message;
    messageElement.classList.add('notification-active', isError ? 'error' : 'info');
    setTimeout(() => {
        messageElement.classList.remove('notification-active');
    }, 3000);
};

const showCart = context => {
    if (context === 'show') {
        cart.classList.add('cart-active');
    } else if (context === 'hide') {
        cart.classList.remove('cart-active');
    }
};

// Lista de productos
const productsList = productData => {
    console.log(productData);
    if (productData && productData.products) {
        const fragment = new DocumentFragment();

        productData.products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.dataset.productId = product.id;

            const productImage = document.createElement('img');
            productImage.src = `img/${product.id}.jpg`;
            productImage.alt = product.name;
            productImage.classList.add('product-img');

            const productName = document.createElement('h3');
            productName.textContent = product.name;
            productName.classList.add('product-name');

            const productDescription = document.createElement('p');
            productDescription.textContent = product.description;
            productDescription.classList.add('product-description');

            const quantityContainer = document.createElement('div');
            quantityContainer.classList.add('quantity-container');

            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.min = 1;
            quantityInput.value = 1;
            quantityInput.required = true;
            quantityInput.classList.add('product-quantity');

            const productPrice = document.createElement('p');
            productPrice.classList.add('product-price');
            productPrice.textContent = `${product.price.toFixed(2)} €`;

            const addToCartButton = document.createElement('button');
            addToCartButton.textContent = 'Add to Cart';
            addToCartButton.className = 'cart-button';
            addToCartButton.dataset.name = 'cart-button';
            addToCartButton.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value, 10);
                if (!isNaN(quantity) && quantity > 0) {
                    addToCart(product, quantity);
                    quantityInput.value = 1;
                } else {
                    showNotification('Introduce una cantidad válida.', true);
                }
            });

            productDiv.appendChild(productImage);
            productDiv.appendChild(productName);
            productDiv.appendChild(productDescription);
            productDiv.appendChild(productPrice);

            quantityContainer.appendChild(quantityInput);
            quantityContainer.appendChild(addToCartButton);
            productDiv.appendChild(quantityContainer);

            fragment.appendChild(productDiv);
        });

        productGrid.appendChild(fragment);
    } else {
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error al cargar los productos. Por favor, inténtelo más tarde.';
        productGrid.appendChild(errorMessage);
    }
};

const addToCart = (product, quantity) => {
    const existingProduct = cartProducts.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += quantity;
        existingProduct.totalPrice = existingProduct.quantity * existingProduct.price;
    } else {
        cartProducts.push({ ...product, quantity, totalPrice: product.price * quantity }); // Agregamos el producto y la cantidad al array
    }

    showProductsInCart(cartProducts);
    showNotification('Producto añadido correctamente', false);
    showCart('show');
};

const calculateTotalPrice = cartProducts => {
    let cartTotalPrice = 0;
    cartProducts.forEach(product => {
        cartTotalPrice += product.totalPrice;
    });
    return cartTotalPrice;
};

const removeFromCart = (productId, quantityToRemove) => {
    const existingProduct = cartProducts.find(item => item.id === productId);
    if (!existingProduct) {
        showNotification('El producto no existe en el carrito', true);
        return;
    }
    if (quantityToRemove === -1) {
        cartProducts.splice(cartProducts.indexOf(existingProduct), 1);
    } else {
        const quantityToRemoveInt = parseInt(quantityToRemove, 10);
        if (!isNaN(quantityToRemoveInt) && quantityToRemove > 0) {
            if (existingProduct.quantity <= quantityToRemoveInt) {
                cartProducts.splice(cartProducts.indexOf(existingProduct), 1);
            } else {
                existingProduct.quantity -= quantityToRemoveInt;
            }
        } else {
            showNotification('Introduce una cantidad válida', true);
            return;
        }
    }

    //Actualizar los precios
    const totalPrice = calculateTotalPrice(cartProducts);
    cartProducts.forEach(cartProduct => {
        cartProduct.totalPrice = cartProduct.price * cartProduct.quantity;
    });

    showProductsInCart(cartProducts, totalPrice);
    showNotification('Producto(s) eliminado(s) correctamente', true);
    showCart('show');
};

const showProductsInCart = cartProducts => {
    // Recibimos el array de productos
    cartItems.textContent = '';
    const totalPrice = calculateTotalPrice(cartProducts);
    const fragment = document.createDocumentFragment();

    cartProducts.forEach(cartProduct => {
        const cartProductDiv = document.createElement('div');
        cartProductDiv.classList.add('cart-product');

        const cartProductName = document.createElement('h4');
        cartProductName.textContent = cartProduct.name;

        const cartProductPrice = document.createElement('p');
        cartProductPrice.textContent = `${cartProduct.totalPrice.toFixed(2)} €`;

        const quantityToRemoveInput = document.createElement('input');
        quantityToRemoveInput.type = 'number';
        quantityToRemoveInput.min = 1;
        quantityToRemoveInput.value = cartProduct.quantity;

        const deleteIcon = document.createElement('span');
        deleteIcon.classList.add('fas', 'fa-trash');
        deleteIcon.addEventListener('click', () => {
            const quantityToRemove = quantityToRemoveInput.value;
            if (quantityToRemove === cartProduct.quantity) {
                removeFromCart(cartProduct.id, '-1');
            } else {
                const quantity = parseInt(quantityToRemove, 10);
                if (!isNaN(quantity) && quantity > 0) {
                    removeFromCart(cartProduct.id, quantity);
                } else {
                    showNotification('Introduce una cantidad válida', true);
                }
            }
        });

        cartProductDiv.appendChild(cartProductName);
        cartProductDiv.appendChild(cartProductPrice);
        cartProductDiv.appendChild(quantityToRemoveInput);
        cartProductDiv.appendChild(deleteIcon);
        fragment.appendChild(cartProductDiv);
    });

    const totalPriceElement = document.createElement('p');
    totalPriceElement.textContent = `Total: ${totalPrice.toFixed(2)} €`;
    totalPriceElement.classList.add('total-price');

    fragment.appendChild(totalPriceElement);

    cartItems.appendChild(fragment);
};

// Modulo Carrito Compra
document.addEventListener('DOMContentLoaded', async () => {
    const productsData = await loadJson('json/products.json');
    productsList(productsData);
});

cartIcon.addEventListener('click', () => {
    showCart('show');
    showProductsInCart(cartProducts); // Pasamos el array de productos
});

closeButton.addEventListener('click', () => {
    showCart('hide');
    cart.classList.remove('cart-active');
});

document.addEventListener('click', e => {
    if (!cart.contains(e.target) && !cartIcon.contains(e.target) && e.target.dataset.name !== 'cart-button') {
        showCart('hide');
    }
});
