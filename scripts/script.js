const headerCityButton = document.querySelector('.header__city-button');
const subheaderCart = document.querySelector('.subheader__cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartListGoods = document.querySelector('.cart__list-goods');
const cartTotalCost = document.querySelector('.cart__total-cost');

let hash = location.hash.substring(1);

function renderCart(){
    cartListGoods.textContent = '';

    const cartItems = getLocalStorage('card-data');

    let totalCost = 0;

    cartItems.forEach((item, i) => {
        const tr = document.createElement('tr');
        
        totalCost += item.cost;

        tr.innerHTML = 
        `
            <td>${i+1}</td>
            <td>${item.brand} ${item.name}</td>
            ${item.color ? `<td>${item.color}</td>` : '<td>-</td>'}
            ${item.sizes ? `<td>${item.sizes}</td>` : '<td>-</td>'}
            <td>${item.cost} &#8381;</td>
            <td><button class="btn-delete" data-id="${item.id}">&times;</button></td>
        `
        cartListGoods.append(tr); 
    })

    cartTotalCost.textContent = `${totalCost} ₽`; 
}

function getCity(){
    headerCityButton.textContent = localStorage.getItem('city') || 'Ваш город?';
}

function setCity(){
    let city = prompt("Введите ваш город: ") || 'Ваш город?';
    localStorage.setItem('city', city);
    getCity();
}

function handleModelCart(e){
    const el = e.target;

    if(el.matches('.cart__btn-close') || el.matches('.cart-overlay')){
        closeModalCart();
    }
}

function getLocalStorage(){
    return JSON?.parse(localStorage.getItem('cart-lomoda')) || [];
}

function setLocalStorage(data){
    localStorage.setItem('cart-lomoda', JSON.stringify(data));
}

function deleteItemCart(id){
    const cartItems = getLocalStorage();
    const newCartItems = cartItems.filter(item => item.id !== id);
    setLocalStorage(newCartItems);
}

function openModalCart(){
    cartOverlay.classList.add('cart-overlay-open');
    disableScroll();
    renderCart();
}

function closeModalCart(){
    cartOverlay.classList.remove('cart-overlay-open');
    enableScroll();
}

function disableScroll(){
    const widthScroll = window.innerWidth - document.body.offsetWidth;

    document.body.style.cssText = `
        overflow: hidden;
        padding-right: ${widthScroll}px;
    `
}

function enableScroll(){
    document.body.style.cssText = '';
}

async function getDate(){
    const data = await fetch('db.json');

    if(data.ok){
        return data.json();
    } else {
        throw new Error(`Данные не были получены, ${data.status}, ${data.statusText}`);
    }
}

function getGoods(callback, prop, value){
    getDate()
        .then(data => {
            if(value) {
                callback(data.filter(item => item[prop] === value))
            } else{
                callback(data);
            }
        })
        .catch(error => console.log(error));
}

getCity();

try{

    const goodsList = document.querySelector('.goods__list');
    const goodsTitle = document.querySelector('.goods__title');

    const createCard = function(data){

        const {id, preview, cost, name, brand, sizes} = data;

        const li = document.createElement('li');

        li.classList.add('goods__item');

        li.innerHTML = `
            <article class="good">
                <a class="good__link-img" href="card-good.html#${id}">
                    <img class="good__img" src="goods-image/${preview}" alt="">
                </a>
                <div class="good__description">
                    <p class="good__price">${cost} &#8381;</p>
                    <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                    ${sizes ?
                    `<p class="good__sizes">Размеры (RUS): <span class="good__sizes-list">${sizes.join(' ')}</span></p>` :
                    ''}
                    <a class="good__link" href="card-good.html#${id}">Подробнее</a>
                </div>
            </article>
        `;
        
        return li;
    }

    const renderGoodList = function(data){
        goodsList.textContent = '';

        data.forEach(item => {
            const card = createCard(item);
            goodsList.append(card);
        })
    }

    window.addEventListener('hashchange', () => {
        let hash = location.hash.substring(1);
        getGoods(renderGoodList, hash);
        goodsTitle.textContent = hash === 'men' ? 'Мужчинам' : hash === 'women' ? 'Женщинам' : 'Детям';
    });

    getGoods(renderGoodList, 'category', hash);

} catch(error){
    console.warn(error);
}

try{
    if(!document.querySelector('.card-good')){
        throw 'This is not a card-good';
    }

    const cardGoodImage = document.querySelector('.card-good__image');
    const cardGoodBrand = document.querySelector('.card-good__brand');
    const cardGoodTitle = document.querySelector('.card-good__title');
    const cardGoodPrice = document.querySelector('.card-good__price');
    const cardGoodColor = document.querySelector('.card-good__color');
    const cardGoodColorList = document.querySelector('.card-good__color-list');
    const cardGoodSizes = document.querySelector('.card-good__sizes');
    const cardGoodSizesList = document.querySelector('.card-good__sizes-list');
    const cardGoodBuy = document.querySelector('.card-good__buy');
    const cardGoodSelectWrapper = document.querySelectorAll('.card-good__select__wrapper');

    const generateList = data => data.reduce((html, item, index) => {
        return html + `<li class="card-good__select-item" data-id="${index}">${item}</li>`
    },'');

    const renderCardGood = function(dataCard){
        const [{id, brand, name, cost, color, sizes, photo}] = dataCard;

        const data = {brand, name, cost, id};

        cardGoodImage.src = `goods-image/${photo}`;
        cardGoodBrand.textContent = brand;
        cardGoodTitle.textContent = name;
        cardGoodPrice.textContent = `${cost} ₽`;
        if(color){
            cardGoodColor.textContent = color[0];
            cardGoodColor.dataset.id = 0;
            cardGoodColorList.innerHTML = generateList(color);
        } else {
            cardGoodColor.style.setProperty('display', 'none');
        }
        if(sizes){
            cardGoodSizes.textContent = sizes[0];
            cardGoodSizes.dataset.id = 0;
            cardGoodSizesList.innerHTML = generateList(sizes);
        } else {
            cardGoodSizes.style.setProperty('display', 'none');
        }

        cardGoodBuy.addEventListener('click', () => {
            if(color){
                data.color = cardGoodColor.textContent;
            }

            if(sizes){
                data.sizes = cardGoodSizes.textContent;
            }

            const cardDataTrash = getLocalStorage();
            if(cardDataTrash.reduce((check, item) => {
                if(item.id === data.id){
                    return true
                }
            }, false))
            {
                alert("Данный товар уже есть в вашей корзине!");
                return
            }
            cardDataTrash.push(data);
            setLocalStorage(cardDataTrash);
        })

    }

    cardGoodSelectWrapper.forEach(item => {
        item.addEventListener('click', e => {
            const el = e.target;

            if(el.matches('.card-good__select')){
                el.classList.toggle('card-good__select__open');
            }

            if(el.matches('.card-good__select-item')){
                const cardGoodSelect = item.querySelector('.card-good__select');
                cardGoodSelect.textContent = el.textContent;
                cardGoodSelect.dataset.id = el.dataset.id;
                cardGoodSelect.classList.remove('card-good__select__open');
            }
        })
    })

    getGoods(renderCardGood, 'id', hash)

} catch(error){
    console.warn(error);
}

headerCityButton.addEventListener('click', setCity);
subheaderCart.addEventListener('click', openModalCart);
cartOverlay.addEventListener('click', handleModelCart);

cartListGoods.addEventListener('click', e => {
    if(e.target.matches('.btn-delete')){
        deleteItemCart(e.target.dataset.id);
        renderCart();
    }
});

window.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
        closeModalCart();
    }
})