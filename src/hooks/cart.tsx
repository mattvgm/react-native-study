import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productStorage = await AsyncStorage.getItem('productsInCart');
      setProducts(JSON.parse(productStorage || '[]'));
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.map(eachProduct =>
        eachProduct.id === id
          ? { ...eachProduct, quantity: eachProduct.quantity + 1 }
          : eachProduct,
      );
      setProducts(newProducts);

      await AsyncStorage.setItem('@GoMarket:Cart', JSON.stringify(newProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products
        .map(eachProduct =>
          eachProduct.id === id
            ? { ...eachProduct, quantity: eachProduct.quantity - 1 }
            : eachProduct,
        )
        .filter(eachNewProduct => eachNewProduct.quantity > 0);
      setProducts(newProducts);
      await AsyncStorage.setItem('@GoMarket:Cart', JSON.stringify(newProducts));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const AlreadyInCart = products.find(
        eachProduct => eachProduct.id === product.id,
      );
      if (AlreadyInCart) {
        console.log('found da same');
        increment(product.id);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem('@GoMarket:Cart', JSON.stringify(products));
      }
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
