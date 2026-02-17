/*export function getGuestId() {
	let gid = localStorage.getItem('guestId');
	if (!gid) {
		gid = Math.random().toString(36).slice(2);
		localStorage.setItem('guestId', gid);
	}
	return gid;
}

export function getCartKey(user) {
	if (user && user.userId) return `cart:${user.userId}`;
	return `cart:guest:${getGuestId()}`;
}

export function readCart(cartKey) {
	try {
		return JSON.parse(localStorage.getItem(cartKey)) || [];
	} catch {
		return [];
	}
}

export function writeCart(cartKey, cart) {
	localStorage.setItem(cartKey, JSON.stringify(cart));
}

export function addToCart(cartKey, product) {
	const cart = readCart(cartKey);
	const idx = cart.findIndex((item) => item._id === product._id);
	if (idx > -1) {
		cart[idx].qty += 1;
	} else {
		cart.push({ ...product, qty: 1 });
	}
	writeCart(cartKey, cart);
}

export function mergeCarts(userCart, guestCart) {
	const byId = new Map();
	for (const item of userCart) {
		byId.set(item._id, { ...item });
	}
	for (const item of guestCart) {
		if (byId.has(item._id)) {
			byId.get(item._id).qty += item.qty;
		} else {
			byId.set(item._id, { ...item });
		}
	}
	return Array.from(byId.values());
}

export function migrateGuestCartToUser(user) {
	if (!user || !user.userId) return;
	const guestKey = `cart:guest:${getGuestId()}`;
	const userKey = getCartKey(user);
	const guestCart = readCart(guestKey);
	if (!guestCart.length) return;
	const userCart = readCart(userKey);
	const merged = mergeCarts(userCart, guestCart);
	writeCart(userKey, merged);
	// limpiar carrito invitado para no re-fusionar en futuros logins
	localStorage.removeItem(guestKey);
} */
	export function getGuestId() {
		let gid = localStorage.getItem('guestId');
		if (!gid) {
			gid = Math.random().toString(36).slice(2);
			localStorage.setItem('guestId', gid);
		}
		return gid;
	}
	
	export function getCartKey(user) {
		if (user && user.userId) return `cart:${user.userId}`;
		return `cart:guest:${getGuestId()}`;
	}
	
	export function readCart(cartKey) {
		try {
			return JSON.parse(localStorage.getItem(cartKey)) || [];
		} catch {
			return [];
		}
	}
	
	export function writeCart(cartKey, cart) {
		localStorage.setItem(cartKey, JSON.stringify(cart));
		// 🔔 Disparar evento global
		window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cartKey } }));
	}
	
	export function getCartCount(cartKey) {
		const cart = readCart(cartKey);
		return cart.reduce((sum, item) => sum + item.qty, 0);
	}
	
	export function updateCartCountUI(elementId, cartKey) {
		const el = document.getElementById(elementId);
		if (el) {
			el.textContent = getCartCount(cartKey);
		}
	}
	
	export function addToCart(cartKey, product) {
		const cart = readCart(cartKey);
		const idx = cart.findIndex((item) => item._id === product._id);
		if (idx > -1) {
			cart[idx].qty += 1;
		} else {
			cart.push({ ...product, qty: 1 });
		}
		writeCart(cartKey, cart);
	}
	
	export function removeFromCart(cartKey, productId) {
		const cart = readCart(cartKey);
		const idx = cart.findIndex((item) => item._id === productId);
		if (idx > -1) {
			cart[idx].qty -= 1;
			if (cart[idx].qty <= 0) {
				cart.splice(idx, 1);
			}
			writeCart(cartKey, cart);
		}
	}
	
	export function mergeCarts(userCart, guestCart) {
		const byId = new Map();
		for (const item of userCart) {
			byId.set(item._id, { ...item });
		}
		for (const item of guestCart) {
			if (byId.has(item._id)) {
				byId.get(item._id).qty += item.qty;
			} else {
				byId.set(item._id, { ...item });
			}
		}
		return Array.from(byId.values());
	}
	
	export function migrateGuestCartToUser(user) {
		if (!user || !user.userId) return;
		const guestKey = `cart:guest:${getGuestId()}`;
		const userKey = getCartKey(user);
		const guestCart = readCart(guestKey);
		if (!guestCart.length) return;
		const userCart = readCart(userKey);
		const merged = mergeCarts(userCart, guestCart);
		writeCart(userKey, merged);
		localStorage.removeItem(guestKey);
	}
	