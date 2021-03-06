import React from 'react'
import {connect} from 'react-redux'
import {
  getCart,
  updateCart,
  removeProduct,
  addQty,
  subtractQty,
  createCart,
  addProduct
} from '../store/singleOrder'
import {fetchProducts} from '../store/products'
import {Link} from 'react-router-dom'
import {editOrder} from '../store/orders'

class Cart extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.handleSubtract = this.handleSubtract.bind(this)
    this.handlePurchase = this.handlePurchase.bind(this)
    this.cartTotal = this.cartTotal.bind(this)
  }
  componentDidMount() {
    const userCart = this.props.getTheCart(this.props.match.params.userId)
  }

  handleClick(event) {
    event.preventDefault()
    if (this.props.user.id) {
      this.props.deleteProduct(this.props.cart.id, event.target.value)
    } else {
      const localCart = JSON.parse(window.localStorage.getItem('cart'))
      delete localCart[event.target.value]
      const stringedCart = JSON.stringify(localCart)
      window.localStorage.setItem('cart', stringedCart)
      this.props.getTheCart()
    }
  }

  handleAdd(event) {
    event.preventDefault()
    if (this.props.user.id) {
      this.props.addQty(this.props.cart.id, event.target.value)
    } else {
      const localCart = JSON.parse(window.localStorage.getItem('cart'))
      localCart[event.target.value] = localCart[event.target.value] + 1
      const stringedCart = JSON.stringify(localCart)
      window.localStorage.setItem('cart', stringedCart)
      this.props.getTheCart()
    }
  }

  handleSubtract(event) {
    event.preventDefault()
    if (this.props.user.id) {
      this.props.subtractQty(this.props.cart.id, event.target.value)
    } else {
      const localCart = JSON.parse(window.localStorage.getItem('cart'))
      localCart[event.target.value] = localCart[event.target.value] - 1
      const stringedCart = JSON.stringify(localCart)
      window.localStorage.setItem('cart', stringedCart)
      this.props.getTheCart()
    }
  }

  handlePurchase = async event => {
    event.preventDefault()
    if (this.props.user.id) {
      this.props.updateCart(this.props.cart.id, {
        isComplete: true
      })
      this.props.history.push(`/checkout/${this.props.cart.id}`)
    } else {
      await this.props.createTheCart({
        isComplete: true
      })
      const localCart = JSON.parse(window.localStorage.getItem('cart'))
      let cartArr = Object.keys(localCart)
      let cartId = this.props.cart.data.id
      for (let i = 0; i < cartArr.length; i++) {
        await this.props.addTheProduct(cartId, cartArr[i])
        for (let j = 1; j < localCart[cartArr[i]]; j++) {
          await this.props.addQty(cartId, cartArr[i])
        }
      }
      this.props.history.push(`/checkout/${cartId}`)
      window.localStorage.clear()
    }
    this.props.editOrder(this.props.cart.products[0].product_order.orderId, {
      total: this.cartTotal()
    })
  }

  cartTotal() {
    let total = 0
    if (!this.props.cart.products) {
      return 0
    } else {
      this.props.cart.products.forEach(product => {
        const productTotal =
          product.product_order.historicalPrice * product.product_order.qty
        total += productTotal
      })
    }
    return total
  }

  render() {
    return (
      <div>
        <div className="cart">
          <h1>Your Cart!</h1>
          <div className="purchase">
            <div>Current total: ${this.cartTotal() / 100}</div>
            <Link to={`/checkout/${this.props.cart.id}`}>
              <button onClick={this.handlePurchase}>Purchase</button>
            </Link>
          </div>
          {this.props.cart.products ? (
            this.props.cart.products.map(product => {
              return (
                <div key={product.id} className="prod-in-cart">
                  <div className="title">{product.productName}</div>

                  <div className="prod-middle">
                    <img src={product.imageUrl} height={200} width={200} />
                    <div className="middle-text">
                      <div>Description: {product.description}</div>
                      <div>
                        Price: $
                        {(
                          product.product_order.historicalPrice / 100
                        ).toString()}
                      </div>
                      <div>
                        <Link to={`/products/${product.id}`}>
                          Link to Product
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>Quantity: {product.product_order.qty}</div>
                    <div id="cart-buttons">
                      <button
                        type="submit"
                        value={product.id}
                        onClick={this.handleClick}
                      >
                        Remove Item
                      </button>

                      <button
                        type="submit"
                        value={product.id}
                        onClick={this.handleAdd}
                      >
                        {' '}
                        Add Qty
                      </button>

                      <button
                        type="submit"
                        value={product.id}
                        onClick={this.handleSubtract}
                      >
                        {' '}
                        Subtract Qty
                      </button>
                    </div>
                  </div>
                  <br />
                </div>
              )
            })
          ) : (
            <h2>Cart is empty</h2>
          )}
        </div>
      </div>
    )
  }
}

const mapState = state => {
  return {
    cart: state.singleOrder,
    user: state.user
  }
}
const mapDispatch = dispatch => {
  return {
    getTheCart: userId => dispatch(getCart(userId)),
    updateCart: (orderId, cart) => dispatch(updateCart(orderId, cart)),
    deleteProduct: (orderId, productId) =>
      dispatch(removeProduct(orderId, productId)),
    addQty: (orderId, productId) => dispatch(addQty(orderId, productId)),
    subtractQty: (orderId, productId) =>
      dispatch(subtractQty(orderId, productId)),
    getProducts: () => dispatch(fetchProducts()),
    createTheCart: cart => dispatch(createCart(cart)),

    editOrder: (orderId, total) => dispatch(editOrder(orderId, total)),
    addTheProduct: (orderId, productId) =>
      dispatch(addProduct(orderId, productId))
  }
}

export default connect(mapState, mapDispatch)(Cart)
