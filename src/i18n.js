import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            nav: {
                home: "Home",
                shop: "Shop",
                categories: "Categories",
                login: "Login",
                signup: "Sign Up",
                dashboard: "Dashboard",
                profile: "Profile",
                logout: "Logout",
                connect_wallet: "Connect Wallet",
                cart: "Cart"
            },
            common: {
                welcome: "Welcome",
                overview: "Overview",
                my_products: "My Products",
                security: "Security",
                users: "Users",
                all_products: "All Products",
                dashboard_overview: "Dashboard Overview",
                total_users: "Total Users",
                total_products: "Total Products",
                total_orders: "Total Orders",
                revenue: "Revenue",
                recent_orders: "Recent Orders",
                order_id: "Order ID",
                date: "Date",
                status: "Status",
                total: "Total",
                no_orders: "No orders found.",
                add_product: "Add Product",
                edit_product: "Edit Product",
                stock: "Stock",
                delete_confirm: "Are you sure you want to delete this product?",
                change_password: "Change Password",
                current_password: "Current Password",
                new_password: "New Password",
                confirm_password: "Confirm New Password",
                update_password: "Update Password",
                password_updated: "Password updated successfully",
                passwords_mismatch: "Passwords do not match",
                please_login: "Please log in"
            },
            success: {
                password_updated: "Password updated successfully"
            },
            hero: {
                title_1: "Experience the Future",
                title_2: "of Shopping",
                subtitle: "Discover a curated collection of premium products designed to elevate your lifestyle. Quality you can trust, style you'll love.",
                shop_now: "Shop Now",
                join_us: "Join Us"
            },
            checkout: {
                title: "Checkout",
                summary: "Order Summary",
                subtotal: "Subtotal",
                shipping: "Shipping",
                taxes: "Taxes",
                total: "Total",
                payment_details: "Payment Details",
                secure_msg: "Payments are secure and encrypted.",
                pay: "Pay",
                processing: "Processing...",
                empty_cart: "Your cart is empty",
                go_back: "Go back to shopping",
                credit_card: "Credit Card",
                crypto: "Crypto (ETH)",
                connect_wallet_msg: "Connect your wallet to pay with Crypto.",
                error_msg: "An error occurred. Please try again.",
                mercadopago_msg: "Click below to pay with MercadoPago:",
                redirect_msg: "You will be redirected to MercadoPago to complete your purchase.",
                powered_mp: "Powered by MercadoPago",
                blockchain_secured: "Blockchain Secured"
            }
        }
    },
    es: {
        translation: {
            nav: {
                home: "Inicio",
                shop: "Tienda",
                categories: "Categorías",
                login: "Ingresar",
                signup: "Registrarse",
                dashboard: "Panel",
                profile: "Perfil",
                logout: "Salir",
                connect_wallet: "Conectar Billetera",
                cart: "Carrito"
            },
            common: {
                welcome: "Bienvenido",
                overview: "Resumen",
                my_products: "Mis Productos",
                security: "Seguridad",
                users: "Usuarios",
                all_products: "Todos los Productos",
                dashboard_overview: "Resumen del Panel",
                total_users: "Usuarios Totales",
                total_products: "Productos Totales",
                total_orders: "Pedidos Totales",
                revenue: "Ingresos",
                recent_orders: "Pedidos Recientes",
                order_id: "ID Pedido",
                date: "Fecha",
                status: "Estado",
                total: "Total",
                no_orders: "No se encontraron pedidos.",
                add_product: "Añadir Producto",
                edit_product: "Editar Producto",
                stock: "Stock",
                delete_confirm: "¿Estás seguro de que deseas eliminar este producto?",
                change_password: "Cambiar Contraseña",
                current_password: "Contraseña Actual",
                new_password: "Nueva Contraseña",
                confirm_password: "Confirmar Nueva Contraseña",
                update_password: "Actualizar Contraseña",
                password_updated: "Contraseña actualizada con éxito",
                passwords_mismatch: "Las contraseñas no coinciden",
                please_login: "Por favor, inicia sesión"
            },
            success: {
                password_updated: "Contraseña actualizada con éxito"
            },
            hero: {
                title_1: "Experimenta el Futuro",
                title_2: "de las Compras",
                subtitle: "Descubre una colección curada de productos premium diseñados para elevar tu estilo de vida. Calidad en la que puedes confiar.",
                shop_now: "Comprar Ahora",
                join_us: "Únete"
            },
            checkout: {
                title: "Finalizar Compra",
                summary: "Resumen del Pedido",
                subtotal: "Subtotal",
                shipping: "Envío",
                taxes: "Impuestos",
                total: "Total",
                payment_details: "Detalles del Pago",
                secure_msg: "Los pagos son seguros y encriptados.",
                pay: "Pagar",
                processing: "Procesando...",
                empty_cart: "Tu carrito está vacío",
                go_back: "Volver a la tienda",
                credit_card: "Tarjeta de Crédito",
                crypto: "Cripto (ETH)",
                connect_wallet_msg: "Conecta tu billetera para pagar con Cripto.",
                error_msg: "Ocurrió un error. Por favor intenta de nuevo.",
                mercadopago_msg: "Haz clic abajo para pagar con MercadoPago:",
                redirect_msg: "Serás redirigido a MercadoPago para completar tu compra.",
                powered_mp: "Procesado por MercadoPago",
                blockchain_secured: "Asegurado por Blockchain"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        detection: {
            order: ['localStorage', 'cookie', 'navigator'],
            caches: ['localStorage', 'cookie']
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
