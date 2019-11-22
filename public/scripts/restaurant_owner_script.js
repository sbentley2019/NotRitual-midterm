const fetchOrderList = function() {
  return $.ajax({
    method: "GET",
    url: "/restaurant/owner/getOrders",
  });
};

/**
 * Retrieves menu item corresponding to order id
 * @param {*} order_id
 */
const retrieveMenuItem = function(order_id) {
  return $.ajax({
    method: "GET",
    url: "/restaurant/owner/" + order_id + "/loadMenuItems",
  });
};

const generateOrderItemsList = function(orderItemList) {
  let listBody = '';
  for (const menuItem of orderItemList) {
    let listItem = `
    <li><a>
    ${menuItem.name}:
    ${menuItem.quantity}
    </a></li>
    `;
    listBody += listItem;
  }
  return listBody;
};


const clearRenderOrderItem = function(element) {
  $(`#${element}`).children().detach();
};

const generateOrder = function(order) {
  let orderBody = $(`
  <div class="cell">
    <div class="card active_order_card_container">
      <div class="card-divider">
          <div class="owner_order_card_header">
              <h4>Order #${order.id}</h4>
              <h6>${order.estimated_end_time - order.start_time} Minutes remaining</h6>
          </div>
      <div style="margin-left: auto; margin-top: auto">

        <form action="/restaurant/owner/complete_order" method="POST" class="orderButtons" data-order-id=${order.id}
        data-order-action="confirm">
            <button class="button orderButtons" type="submit" id="completeButton">Confirm</button>
            <input type="hidden" name="order_id" value="${order.id}">
        </form>
        <form action="/restaurant/owner/cancel_order" method="POST" class="orderButtons" data-order-id=${order.id}
        data-order-action="cancel">
          <button class="button orderButtons" type="submit" id="cancelButton">Cancel</button>
          <input type="hidden" name="order_id" value="${order.id}">
        </form>
      </div>
      </div>
      <div class="owner_order_card_body">
          <ul class="vertical menu" style="margin: 25px;" id="order-body-${order.id}">

          </ul>

      </div>
      <div class="card-divider">
          <span class="owner_order_card_footer">
              <div>
                  <p>From:</p>
                  <p>ID: ${order.user_id} </p>
              </div>
              <h5>Price ${order.total_cost}</h5>
          </span>
        </div>
      </div>
    </div>`);
  return orderBody;
};

const generatePendingOrder = function(order) {

  let orderBody = $(`
  <div class="cell">
                    <div class="card" style='padding: 0%;'>
                        <div class="card-divider">
                            <div class="owner_order_card_header">
                                <h4>Order #${order.id}</h4>
                                <h6>Estimated Cook time: ${order.estimated_end_time - order.start_time}</h6>
                            </div>
                            <div style="margin-left: auto; margin-top: auto">
                            </div>
                        </div>
                        <div class="owner_order_card_body">
                            <ul class="vertical menu" style="margin: 25px;" id="pendingOrderBody-${order.id}">

                            </ul>
                        </div>
                          <div class="card-divider owner_order_card_footer">
                            <span style="width: 60%; margin: auto">
                              <div class="cell small-2">
                                <input type="number" id="sliderOutput2" name="order_time" form="acceptForm">
                              </div>
                            </span>
                          <div>
                          <form action="/restaurant/owner/confirm_order" method="POST" class="orderButtons" id="acceptForm"
                          data-order-id=${order.id}
                          data-order-action="accept">
  <button class="button orderButtons" type="submit" id="acceptButton">Accept</button>
  <input type="hidden" name="order_id" value="${order.id}">
  </form>
  <form action="/restaurant/owner/cancel_order" method="POST" class="orderButtons" data-order-id=${order.id}
  data-order-action="cancel">
  <button class="button orderButtons" type="submit" id="cancelButton2">Cancel</button>
  <input type="hidden" name="order_id" value="${order.id}">
  </form>
                    </div>
                </div>
            </div>
        </div>`);
  return orderBody;
};

$(() => {
  clearRenderOrderItem('ordersGrid');
  clearRenderOrderItem('pendingOrdersGrid')

  const renderOrders = function() {
    fetchOrderList().then(orderList => {
      for (const order of orderList.orderItems) {

        console.log(order.current_status);

        if (order.current_status === 'Accepted') {
          $("#ordersGrid").prepend(generateOrder(order));

          retrieveMenuItem(order.id).then(orderItemList => {
            $(`#order-body-${order.id}`).prepend(generateOrderItemsList(orderItemList));
          })
        } else if (order.current_status === 'Pending') {
          $("#pendingOrdersGrid").prepend(generatePendingOrder(order));

          retrieveMenuItem(order.id).then(orderItemList => {
            $(`#pendingOrderBody-${order.id}`).prepend(generateOrderItemsList(orderItemList));
          });
        }
      }
    });
  };

  renderOrders();

  function acceptOrder(orderId) {
    return $.ajax({
      method: 'POST',
      url: '/restaurant/owner/confirm_order',
      data: {
        order_id: orderId
      }
    })
  }

  function cancelOrder(orderId) {
    return $.ajax({
      method: 'POST',
      url: '/restaurant/owner/cancel_order',
      data: {
        order_id: orderId
      }
    })
  }

  function confirmOrder(orderId) {
    return $.ajax({
      method: 'POST',
      url: '/restaurant/owner/complete_order',
      data: {
        order_id: orderId
      }
    })
  }

  $(document).on('submit', "form.orderButtons", function(event) {
    event.preventDefault();

    var $this = $(this);
    debugger;

    var orderId = $this.data('order-id');
    var action = $this.data('order-action');

    if (action == "accept") {
      acceptOrder(orderId).then(function(response) {
        clearRenderOrderItem('ordersGrid');
        clearRenderOrderItem('pendingOrdersGrid');
        renderOrders();
      })
    } else if (action == "cancel") {
      cancelOrder(orderId).then(function(response) {
        clearRenderOrderItem('ordersGrid');
        clearRenderOrderItem('pendingOrdersGrid');
        renderOrders();
      })
    } else if (action == "confirm") {
      confirmOrder(orderId).then(function(response) {
        clearRenderOrderItem('ordersGrid');
        clearRenderOrderItem('pendingOrdersGrid');
        renderOrders();
      })
    }
  });
});
