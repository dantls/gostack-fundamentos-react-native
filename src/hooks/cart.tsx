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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsArray = await AsyncStorage.getItem('@GoShopp:products');
      if (productsArray) {
        setProducts(JSON.parse(productsArray));
      }
      // await AsyncStorage.removeItem('@GoShopp:products');
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(item => product.id === item.id);

      if (productExists) {
        setProducts(
          products.map(productCart =>
            productCart.id === product.id
              ? { ...productCart, quantity: productCart.quantity + 1 }
              : productCart,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem('@GoShopp:products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const findProduct = products.find(product => product.id === id);

      if (findProduct) {
        setProducts(
          products.map(productCart =>
            productCart.id === id
              ? { ...productCart, quantity: productCart.quantity + 1 }
              : productCart,
          ),
        );
      }
      await AsyncStorage.setItem('@GoShopp:products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const findProduct = products.find(product => product.id === id);

      if (findProduct && findProduct.quantity > 1) {
        setProducts(
          products.map(productCart =>
            productCart.id === id
              ? { ...productCart, quantity: productCart.quantity - 1 }
              : productCart,
          ),
        );
      } else {
        setProducts(products.filter(product => product.id !== id));
      }

      await AsyncStorage.setItem('@GoShopp:products', JSON.stringify(products));
    },
    [products],
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
