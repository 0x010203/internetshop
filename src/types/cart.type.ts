export type CartType = {
  items: 
    {
      product: {
        id: string;
        name: string;
        price: number;
        url: string;
        image: string;
      };
      quantity: number;
    }[]
  
};
