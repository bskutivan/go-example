$(document).ready(function() {
  // Convert price string to a floating-point number
  parsePrice = function(priceStr) {
    return parseFloat(priceStr.replace(/[^\d\.]/g, ''));
  }
  // Grid Item Swatch click event listener and handler - to be refactored later
  $('.grid__item .color-swatch-container').each(function() {
    $(this).on('click', async function() {

      // Primary Els and Values
      let clickedSwatch = $(this).find('.color-swatch');
      let clickedSwatchValue = $(this).attr('data-color');
      let ancestorGridItem = $(this).closest('.grid__item');
      let gridItemSwatchlabel = ancestorGridItem.find('.label.current_color');
      let srcSet = $(this).attr('data-srcset');
      let hoverSrcSet = $(this).attr('data-hoversrcset');
      let fauxCartSrcSet = $(this).attr('data-fauxcartsrcset');
      let prodId = $(this).attr('data-product-id');
      let prodURL = $(this).attr('data-product-url');
      let prodTitle = $(this).attr('data-product-title');
      let productImages = $(this).closest('.grid-product__content');
      let productPrice = $(this).attr('data-product-price');
      let productSalePrice = $(this).attr('data-product-sale-price');
      let addOnBlock = $(this).attr('data-addon-block');
      let inventory = $(this).attr('data-inventory');

      // Grid Item Secondary Els and Values
      let productLink = productImages.find('.grid-product__link');
      let productTitleLink = ancestorGridItem.find('.title-container');
      let primaryImage = productImages.find('.grid__image-ratio img');
      let hoverImage = productImages.find('.grid-product__secondary-image img');
      let parsedColor = clickedSwatchValue.replace(/-/g, " ");

      // Get total available of this colorway
      const totalAvailable = await getTotalAvailable(prodId, inventory)
      // Update ATC button for grid item to read accurately
      toggleATC(ancestorGridItem, totalAvailable)

      // Check if clicked swatch is already the active swatch
      if (clickedSwatch.hasClass('active-swatch')) {
        return
      } else {

        // Remove active class from swatches
        let swatchesContainer = $(this).closest('.swatches-wrapper');
        let swatches = swatchesContainer.find('.color-swatch');

        if (swatches.length > 0) {
          swatches.each(function() {
            if($(this).hasClass('active-swatch')) {
              $(this).removeClass('active-swatch');
            }
          })
        }
        // Add active class to clicked swatch on grid item
        clickedSwatch.addClass('active-swatch');


      let numProductSalePrice = parsePrice(productSalePrice);
      let numProductPrice = parsePrice(productPrice);
      let content

      if (addOnBlock) {
        if (numProductSalePrice > 0 && numProductSalePrice < numProductPrice) {


          
          content = `<div class="grid-product__price"><span class="visually-hidden">Regular price</span>` +
                        `<span class="grid-product__price--original go-price-regular">${productPrice}</span>` +
                        `<span class="visually-hidden">Sale price</span><span class="grid-product__price--savings">${productSalePrice}</span></div>`;
          let priceContainer = ancestorGridItem.find('.grid-product__price');

          priceContainer[0].classList.add('line-through')
          priceContainer.html(content);
        } else {
          content = `${productPrice}`

          let priceContainer = ancestorGridItem.find('.grid-product__price');
          priceContainer.html(content);
        }
      } else {
        if (numProductSalePrice > 0 && numProductSalePrice < numProductPrice) {
          
          content = `<div class="grid-product__price"><span class="visually-hidden">Regular price</span>` +
                        `<span class="grid-product__price--original go-price-regular">${productPrice}</span>` +
                        `<span class="visually-hidden">Sale price</span><span class="grid-product__price--savings">${productSalePrice}</span></div>`;
          let priceContainer = ancestorGridItem.find('.grid-product__price');
          priceContainer[0].classList.add('line-through')
          priceContainer.html(content);
        } else {
          content = `<div class="grid-product__price">${productPrice}</div>`;
          
          let priceContainer = ancestorGridItem.find('.grid-product__price');
          priceContainer.html(content);
        }
      }

        // Update grid image if they exist
        if (primaryImage.length && hoverImage.length) {
          primaryImage.attr('srcset', srcSet);
          primaryImage.attr('data-srcset', srcSet);
          hoverImage.attr('srcset', hoverSrcSet);
          hoverImage.attr('data-srcset', hoverSrcSet);
          productLink.attr('href', prodURL);
          productLink.attr('title', prodTitle);
          productTitleLink.attr('href', prodURL);
          gridItemSwatchlabel.text(parsedColor);

          // update grid items root values use by fauxcart js
          ancestorGridItem.attr('data-product-id', prodId);
          ancestorGridItem.attr('data-product-color', parsedColor);
          ancestorGridItem.attr('data-product-image', fauxCartSrcSet);
          ancestorGridItem.attr('data-product-price', productPrice);
          ancestorGridItem.attr('data-product-sale-price', productSalePrice);

        }
      }
    });
  });


  // Color swatch change functions and Add to cart functions

        $('.color-swatch-container').on('mouseover', function(){
          $(this).find('.color-swatch-color-name').addClass('is-active')
        })
        $('.color-swatch-container').on('mouseleave', function(){
          $(this).find('.color-swatch-color-name').removeClass('is-active')
        })

        async function getTotalAvailable(selectedID, inventory) {
          // Checks cart to see if selected colorway already has been added to cart in any quantity
          // Returns total available of colorway  
          try { 
              let quantityInCart = 0;
              let totalAvailable = inventory
              const response = await fetch(window.Shopify.routes.root + 'cart.js');
              const cartContents = await response.json();
              if(cartContents.items){
                for(const item of cartContents.items){
                  let loopID = item.variant_id
                  if(loopID == selectedID ){
                    quantityInCart += item.quantity
                  }
                }
              }
              if(quantityInCart > 0){
                totalAvailable = totalAvailable - quantityInCart
              }
              return totalAvailable;
          } catch (error) {
              console.error('Error fetching cart contents:', error);
          }
        }
        async function toggleATC(ancestorGridItem, totalAvailable){
          let atcButton = ancestorGridItem.find('.go-bundle-grid-item-atc--btn')
          
          if(totalAvailable > 0){
            // If variant is available, re-enable ATC if previously disabled
            $(atcButton).find('span').text('Add to cart')
            $(atcButton).prop('disabled', false)
          }else{
            // If variant is not available, disable ATC
            $(atcButton).find('span').text('SOLD OUT')
            $(atcButton).prop('disabled', true)
          }
        }
  

        function addGridItemToCart(ancestorGridItem, variantId, totalAvailable, source){
            // let variantId = $(product).data('product-id');
            let sourceProperties = {"unsourced":true}
            if (source == "pdp-upsell") {
              sourceProperties = {"_go-bundle-pdp-upsell":true}
            } else if (source == "pdp-shop-the-look") {
              sourceProperties = {"_go-bundle-pdp-shop-the-look":true}
            } 
              
            const productToAdd = {
                id: variantId,
                quantity: 1,
                properties: sourceProperties
            }
            // Add items to Shopify cart
            $.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: productToAdd,
                dataType: 'json',
                success: function(data) {
                    console.log('success', data)
                    document.dispatchEvent(new CustomEvent('cart:build'));
        		        document.dispatchEvent(new CustomEvent('cart:open'));
                    if(totalAvailable - 1 <= 0){
                      toggleATC(ancestorGridItem, 0)
                    }
                },
                error: function() {
                    document.addEventListener('ajaxProduct:error', function(evt) {
                        console.log(evt.detail.errorMessage);
                    });
                }
            });
}
            $('.go-bundle-grid-item-atc--btn').on('click', async function(){
              let source = $(this).data('gtm-atc-source');
              let activeSwatch = $(this).closest('.go-bundle-grid-item').find(' .color-swatch.active-swatch')
              let ancestorGridItem = $(this).closest(".grid__item")
              let selectedVarId = $(activeSwatch).closest('.color-swatch-container').attr('data-product-id')
              let inventory = $(activeSwatch).closest('.color-swatch-container').attr('data-inventory')
              const totalAvailable = await getTotalAvailable(selectedVarId, inventory)
              addGridItemToCart(ancestorGridItem, selectedVarId, totalAvailable, source)
            })

})