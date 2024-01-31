// simulate getting products from DataBase
// const products = [
//   { name: 'Apples_:', country: 'Italy', cost: 3, instock: 10 },
//   { name: 'Oranges:', country: 'Spain', cost: 4, instock: 3 },
//   { name: 'Beans__:', country: 'USA', cost: 2, instock: 5 },
//   { name: 'Cabbage:', country: 'USA', cost: 1, instock: 8 },
// ];
// //=========Cart=============

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);
  const [random, setRandom] = useState(0);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log('useEffect Called');
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const result = await axios(url);
        console.log('FETCH FROM URl');
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [random]);
  return [state, setRandom];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState([
    { attributes: { name: '', cost: '' } },
  ]);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } =
    ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('http://localhost:1337/api/products');
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'http://localhost:1337/api/products',
    [{ attributes: { name: '', cost: '' } }]
  );

  useEffect(() => {
    if (!data.data) return;
    setItems(data.data);
    console.log('data.data', data.data);
  }, [data]);

  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.attributes.name === name);
    if (item[0].attributes.instock < 1) return;
    setItems(
      items.map((item) => {
        if (item.attributes.name === name) item.attributes.instock--;
        return item;
      })
    );
    console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
  };
  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index != i);
    setItems(
      items.map((item, i) => {
        if (item.attributes.name === cart[index].attributes.name)
          item.attributes.instock++;
        return item;
      })
    );
    setCart(newCart);
  };
  const photos = ['apple.png', 'orange.png', 'beans.png', 'cabbage.png'];

  // Instock product list:
  console.log('items:', items);
  let list = items.map(({ attributes }, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";
    return (
      <li key={index} className="my-3">
        <Card className="p-2">
          <Image
            src={photos[index % 4]}
            width={70}
            roundedCircle
            className="mx-auto"
          ></Image>
          <div className="text-center">
            {attributes.name} <br></br>
            {attributes.instock} items in stock <br></br>
            Price: ${Number(attributes.cost).toFixed(2)} each
          </div>
          <Button name={attributes.name} type="submit" onClick={addToCart}>
            Add to Cart
          </Button>
        </Card>
      </li>
    );
  });

  // Cart List
  let cartList = cart.map(({ attributes: { name, cost, country } }, index) => {
    return (
      <Accordion.Item key={1 + index} eventKey={1 + index}>
        <Accordion.Header>{name}</Accordion.Header>
        <Accordion.Body
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          $ {cost} from {country}
        </Accordion.Body>
      </Accordion.Item>
    );
  });

  // Checkout List
  let finalList = () => {
    let total = checkOut();
    let final = cart.map(({ attributes: { name } }, index) => {
      return (
        <div key={index} index={index}>
          {name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.attributes.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };

  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({
      data: { name: 'Apples', country: 'Italy', cost: 5, instock: 5 },
      // data: [{ name: 'Oranges', country: 'Spain', cost: 5, instock: 5 }],
      // {attributes: { name: 'Oranges', country: 'Spain', cost: 5, instock: 5 }},
      // {attributes: { name: 'Beans', country: 'USA', cost: 5, instock: 5 }},
      // {attributes: { name: 'Cabbage', country: 'USA', cost: 5, instock: 5 }}
      // ],
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    fetch('http://localhost:1337/api/products', requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log('post result:', result);
        doFetch(Math.random());
        console.log('posted:', result);
      })
      .catch((error) => console.log('error', error));
    console.log('test1');
    if (!data.data) return;
    console.log('test2');
    setItems(data.data);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul className="px-0 mx-2" style={{ listStyleType: 'none' }}>
            {list}
          </ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(query);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById('root'));
