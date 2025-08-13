// root&white interactions — slider, cart, checkout
const state = {
  products: [
    {id:'latte', title:'Iced Latte', tag:'coffee', price:28000, img:'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1400&auto=format&fit=crop'},
    {id:'mocha', title:'Mocha Melt', tag:'coffee', price:32000, img:'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?q=80&w=1400&auto=format&fit=crop'},
    {id:'matcha', title:'Matcha Breeze', tag:'noncoffee', price:30000, img:'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=1400&auto=format&fit=crop'},
    {id:'lemon', title:'Lemon Spark', tag:'noncoffee', price:22000, img:'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=1400&auto=format&fit=crop'},
    {id:'sandwich', title:'Chicken Sandwich', tag:'food', price:34000, img:'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop'},
    {id:'pasta', title:'Creamy Pasta', tag:'food', price:38000, img:'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1400&auto=format&fit=crop'},
    {id:'brownie', title:'Fudge Brownie', tag:'dessert', price:24000, img:'https://images.unsplash.com/photo-1606313564200-e75d5e30476e?q=80&w=1400&auto=format&fit=crop'},
    {id:'croffle', title:'Choco Croffle', tag:'dessert', price:26000, img:'https://images.unsplash.com/photo-1600334129128-685c5582fd5e?q=80&w=1400&auto=format&fit=crop'},
  ],
  cart: JSON.parse(localStorage.getItem('rw-cart') || '[]')
};

// Utils
const rupiah = n => n.toLocaleString('id-ID',{style:'currency', currency:'IDR'});
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

document.addEventListener('DOMContentLoaded', () => {
  // Year
  $('#year').textContent = new Date().getFullYear();

  // Mobile nav
  const nav = $('.nav-links'); const ham = $('#hamburger');
  ham.addEventListener('click', ()=> nav.classList.toggle('open'));

  // Progress bar on scroll
  const progress = $('#topProgress');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop)/(h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
  });

  // Render products
  const grid = $('#productGrid');
  function drawProducts(filter='all'){
    grid.innerHTML = '';
    state.products
      .filter(p => filter==='all' ? true : p.tag===filter)
      .forEach(p => {
        const el = document.createElement('div');
        el.className = 'product';
        el.innerHTML = \`
          <img src="\${p.img}" alt="\${p.title}" loading="lazy"/>
          <div class="content">
            <div class="row">
              <div class="title">\${p.title}</div>
              <span class="tag">\${p.tag}</span>
            </div>
            <div class="meta">
              <span class="price">\${rupiah(p.price)}</span>
              <button class="btn small add" data-id="\${p.id}">Tambah</button>
            </div>
          </div>\`;
        grid.appendChild(el);
      });
  }
  drawProducts();

  // Filters
  $$('.chip').forEach(ch => ch.addEventListener('click', () => {
    $$('.chip').forEach(c => c.classList.remove('active'));
    ch.classList.add('active');
    drawProducts(ch.dataset.filter);
  }));

  // Add to cart
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.add');
    if(!btn) return;
    const id = btn.dataset.id;
    const item = state.products.find(p => p.id===id);
    const existing = state.cart.find(c => c.id===id);
    if(existing){ existing.qty += 1; }
    else{ state.cart.push({id, title:item.title, price:item.price, img:item.img, qty:1}); }
    persistCart();
    drawCart();
    pulseCart();
  });

  // Slider
  initSlider();

  // Cart drawer
  $('#openCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  $('#backdrop').addEventListener('click', closeCart);
  $('#clearCart').addEventListener('click', () => { state.cart = []; persistCart(); drawCart(); });
  $('#cartCheckout').addEventListener('click', () => { closeCart(); openCheckout(); });

  drawCart();

  // Checkout modal
  $('#openCheckout').addEventListener('click', openCheckout);
  $('#closeCheckout').addEventListener('click', closeCheckout);
  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    // simple success (mock)
    closeCheckout();
    state.cart = [];
    persistCart();
    drawCart();
    alert('Terima kasih! Pesanan kamu diproses. 😊');
  });
});

function initSlider(){
  const slides = $('#slides');
  const dotsWrap = $('#dots');
  const slideEls = slides.children;
  let index = 0;
  const total = slideEls.length;

  for(let i=0;i<total;i++){
    const d=document.createElement('button');
    d.setAttribute('aria-label','Slide '+(i+1));
    if(i===0) d.classList.add('active');
    d.addEventListener('click', ()=> goTo(i));
    dotsWrap.appendChild(d);
  }

  function goTo(i){
    index = (i+total)%total;
    slides.style.transform = \`translateX(-\${index*100}%)\`;
    [...dotsWrap.children].forEach((d,j)=> d.classList.toggle('active', j===index));
  }

  $('.prev').addEventListener('click', ()=> goTo(index-1));
  $('.next').addEventListener('click', ()=> goTo(index+1));

  // auto play
  setInterval(()=> goTo(index+1), 5000);

  // drag / swipe
  let startX=null;
  slides.addEventListener('pointerdown', e=> startX=e.clientX);
  slides.addEventListener('pointerup', e=> {
    if(startX===null) return;
    const delta = e.clientX - startX;
    if(Math.abs(delta) > 40){
      if(delta<0) goTo(index+1); else goTo(index-1);
    }
    startX=null;
  });
}

function drawCart(){
  $('#cartCount').textContent = state.cart.reduce((a,c)=>a+c.qty,0);
  $('#cartItems').innerHTML = state.cart.length ? '' : '<p class="muted">Keranjang kosong</p>';
  let total = 0;
  state.cart.forEach(item => {
    total += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = \`
      <img src="\${item.img}" alt="\${item.title}" />
      <div>
        <div><strong>\${item.title}</strong></div>
        <div class="muted">\${rupiah(item.price)} x \${item.qty}</div>
      </div>
      <div class="qty">
        <button data-act="dec" data-id="\${item.id}">-</button>
        <span>\${item.qty}</span>
        <button data-act="inc" data-id="\${item.id}">+</button>
      </div>\`;
    $('#cartItems').appendChild(el);
  });
  $('#cartItems').addEventListener('click', onQtyClick, {once:true});
  $('#cartTotal').textContent = rupiah(total);
  // update checkout summary
  const summary = $('#checkoutSummary');
  if(summary){
    summary.innerHTML = state.cart.length ? '' : '<p class="muted">Belum ada item. Tambahkan dari menu ya!</p>';
    state.cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'item';
      row.innerHTML = \`<span>\${item.title} × \${item.qty}</span><span>\${rupiah(item.price*item.qty)}</span>\`;
      summary.appendChild(row);
    });
    if(state.cart.length){
      const grand = state.cart.reduce((s,i)=>s+i.price*i.qty,0);
      const row = document.createElement('div');
      row.className='item';
      row.innerHTML = \`<strong>Total</strong><strong>\${rupiah(grand)}</strong>\`;
      summary.appendChild(row);
    }
  }
}

function onQtyClick(e){
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.dataset.id;
  const act = btn.dataset.act;
  const item = state.cart.find(i => i.id===id);
  if(!item) return;
  if(act==='inc') item.qty += 1;
  if(act==='dec') item.qty -= 1;
  if(item.qty<=0){ state.cart = state.cart.filter(i=>i.id!==id); }
  persistCart(); drawCart();
}

function openCart(){ $('#cart').classList.add('open'); $('#backdrop').style.display='block'; }
function closeCart(){ $('#cart').classList.remove('open'); $('#backdrop').style.display='none'; }
function openCheckout(){ if(state.cart.length===0){ alert('Keranjang masih kosong.'); return; } $('#checkoutSummary').innerHTML=''; drawCart(); $('#checkoutModal').showModal(); }
function closeCheckout(){ $('#checkoutModal').close(); }

function persistCart(){ localStorage.setItem('rw-cart', JSON.stringify(state.cart)); }
function pulseCart(){ const b = $('#openCart'); b.style.transform='scale(1.05)'; setTimeout(()=> b.style.transform='scale(1)', 150); }
