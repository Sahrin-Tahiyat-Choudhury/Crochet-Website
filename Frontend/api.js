const API = (() => {
    const BASE = window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:3000/api'
  : 'https://crochet-website-7n9s.onrender.com/api';

    async function request(method, path, body = null, isFormData = false) {
        const options = {
            method,
            credentials: 'include',
            headers: {}
        };

        if (body) {
            if (isFormData) {
                options.body = body;
            } else {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }
        }

        const response = await fetch(BASE + path, options);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    }

    const get = (path) => request('GET', path);
    const post = (path, body, formData = false) =>
        request('POST', path, body, formData);
    const patch = (path, body) =>
        request('PATCH', path, body);
    const del = (path) =>
        request('DELETE', path);

    return {
        products: {
            getAll: () => get('/product?limit=200'),  // ← add ?limit=200
            getById: (id) => get(`/product/products/${id}`),
            search:  (params = {}) => {
                const qs = new URLSearchParams(params).toString();
                return get(`/product/search${qs ? '?' + qs : ''}`);
            }

        },
        orders: {
            // api.js

            getAll: (params = {}) => {
                const qs = new URLSearchParams(params).toString();
                return get(`/order/all-orders${qs ? '?' + qs : ''}`);
            },
            getMyOrders: () => get('/order/my-orders'), 
            updateOrderStatus: (id, body) => patch(`/order/update-order-status/${id}`, body),
            cancel: (id) => patch (`/order/cancel-order/${id}`),
            placeOrder: (data) => request("POST", "/order/place-order", data),
            refundOrder: (id, body) => patch (`/order/refund-order/${id}`,body)       
        },
        cart: {
    get:          ()       => get(`/cart`),
    add:          (data)   => post(`/cart/add`, data),
    updateItem:   (productId, data) => patch(`/cart/item/${productId}`, data),
    removeItem:   (productId)       => del(`/cart/item/${productId}`),
    clear:        ()       => del(`/cart/clear`),
    applyCoupon:  (code)   => post(`/cart/apply-coupon`, { code }),
    removeCoupon: ()       => del(`/cart/coupon`),
},
        categories: {
            getAll: () => get(`/product/categories`),
            getById: (id) => get(`/product/categories/${id}`)
        },
        analytics: {
            getStats: (period = 'this_month') => get(`/analytics?period=${period}`)
        },

        users: {
            getMe: () =>
            get(`/auth/get-me`),

            updateProfile: (data) =>
            patch(`/auth/update-profile`, data),
    
            changePassword: (data) =>
            patch(`/auth/change-password`, data),

            uploadPhoto: (data) =>
            patch(`/auth/upload-photo`, data)

        },
        auth: {
            register: (data) => post('/auth/register',data),
            login: (data) => post('/auth/login',data),
            logout: () => get('/auth/logout'),
        }
        customers: {
            getAll: () => get(`/customer`),
            getById: (id) => get(`/customers/${id}`),
            delete: (id) => del(`/customers/${id}`),
            sendMessage: (id, subject, message) => post(`/customer/${id}/message`, { subject, message })
        },
        settings: {
            get: () =>
            get("/settings"),
            update: (data) => patch("/settings", data)
        },
        customOrder: {
            submit: (data) => post('/customOrder', data),
            list: () => get('/customOrder/custom-orders')
        },
        bouquetOrder: {
            getAll: () => get('/bouquetOrder/bouquet-items'),
            submit: (data) => post('/bouquetOrder',data),
             getAdminAll: () => get('/bouquetOrder/admin/bouquet-orders'),
             reject: (id) => patch(`/bouquetOrder/reject-order/${id}`),
             confirm: (id) => patch(`/bouquetOrder/confirm-order/${id}`)
        },
        content: {
    getAbout: () => get('/content/about'),
    getFaq: () => get('/content/faq'),
    getPolicies: () => get('/content/policies'),
    updateAbout: (data) => patch('/content/about', data),
    updateFaq: (data) => patch('/content/faq', data),
    updatePolicies: (data) => patch('/content/policies', data)
},
        contact: {
            send: (data) => post('/contact', data),
            getMessages: () => get('/contact/messages')
        },
        reviews: {
    getAll: () => get('/review'),

    getByProduct: (productId) =>
        get(`/review/product/${productId}`),

    create: (productId, data) =>
        post(`/review/product/${productId}`, data),

    update: (reviewId, data) =>
        patch(`/review/${reviewId}`, data),

    delete: (reviewId) =>
        del(`/review/${reviewId}`),

    respond: (reviewId, data) =>
        patch(`/review/${reviewId}/respond`, data)
},
        admin: {

            //Products

            createProduct: (formData) =>
                post('/product/upload', formData, true),

            editProduct: (data) =>
                patch('/product/edit-product', data),

            deleteProduct: (id) =>
                del(`/product/delete-product/${id}`),
            
            importProducts: (formData) =>
                post('/product/import', formData, true),

            // Categories
            create:  (data) => post('/product/category', data),
    
            update:  (data) => patch('/product/edit-category', data),
    
            delete:  (id) => del(`/product/delete-category/${id}`),
            
            manualOrder: (data) => request("POST", "/order/manual-order", data),

            //Coupons


            // Coupons

            getCoupons:    () => get('/coupon/coupons'),

            createCoupon:  (data) => post('/coupon/coupons', data),

            updateCoupon:  (id, data) => patch(`/coupon/coupons/${id}`, data),

            deleteCoupon:  (id) => del(`/coupon/coupons/${id}`),
        }
    };
})();
