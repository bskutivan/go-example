$(document).ready(function() {
  // Slick args
  let centeredArgs = {
    centerMode: true,
    centerPadding: '0px',
    slidesToShow: 3,
    arrows: true,
    nextArrow: '',
    prevArrow: '',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: '40px',
          slidesToShow: 3
        }
      },
      {
        breakpoint: 600,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: '40px',
          slidesToShow: 1
        }
      }
    ]
  }

  let fauxCart = {
    items: [],
    totalOriginalPrice: 0,
    totalDiscountedPrice: 0,
    updateTotals: function () {
        var discountValue = parseFloat($('#discountValue').data('discount'));

        this.totalOriginalPrice = 0;
        this.totalDiscountedPrice = 0;

        this.items.forEach(item => {
            if (!item.hidden) {
                this.totalOriginalPrice += item.originalPrice;
                // Apply the discount
                var discount = item.originalPrice * discountValue / 100;
                item.discountedPrice = item.originalPrice - discount;
                this.totalDiscountedPrice += item.discountedPrice;
            }
        });

        const isDesktopView = $(window).width() >= 769;
        const $totalPriceOrig = isDesktopView ? $('.faux-cart .total-price-orig') : $('.mobile-cart .total-price-orig, .mobile-go-button .total-price-orig');
        const $totalPriceDiscount = isDesktopView ? $('.faux-cart .total-price-discount') : $('.mobile-cart .total-price-discount, .mobile-go-button .total-price-discount');
        
        if (this.totalOriginalPrice === this.totalDiscountedPrice) {
            $totalPriceOrig.hide();
        } else {
            $totalPriceOrig.text(`$${this.totalOriginalPrice.toFixed(2)}`).show();
        }
        
        $totalPriceDiscount.text(`$${this.totalDiscountedPrice.toFixed(2)}`);
    },
    updateCartItem: function (index, productData) {
        let item = this.items[index];
        if (!item) {
            item = { hidden: true };
            this.items[index] = item;
        }

        item.productId = productData.productId;
        item.originalPrice = parseFloat(productData.productPrice.replace('$', '')) || 0;
        item.discountedPrice = parseFloat(productData.productSalePrice.replace('$', '')) || item.originalPrice;
        item.hidden = !(productData.productTitle && productData.productPrice);

        let fauxCartItem = $('.faux-cart__body .product-card').eq(index);
        fauxCartItem.attr('data-product-id', productData.productId);

        let mobileFauxCartItem = $('.mobile-cart__items .mobile-cart__item').eq(index);
        mobileFauxCartItem.attr('data-product-id', productData.productId);

        if (!item.hidden) {
            fauxCartItem.find('.product-title').text(productData.productTitle);
            fauxCartItem.find('.product-price').text(productData.productPrice);
            fauxCartItem.find('.product-price-discount').text(productData.productSalePrice);
            fauxCartItem.find('.product-color').text(productData.productColor);
            fauxCartItem.find('.product-image').attr('src', productData.productImage);
            fauxCartItem.removeClass('hidden');
            mobileFauxCartItem.find('.mobile-cart__name').text(productData.productTitle);
            mobileFauxCartItem.find('.product-price').text(productData.productPrice);
            mobileFauxCartItem.find('.product-price-discount').text(productData.productSalePrice);
            mobileFauxCartItem.find('.product-color').text(productData.productColor);
            mobileFauxCartItem.find('.mobile-cart__image').attr('src', productData.productImage);
            mobileFauxCartItem.removeClass('hidden');

        } else {
            fauxCartItem.addClass('hidden');
        }
        this.updateTotals();
    }
};

  let resizeTimer;
  $(window).resize(function() {
      if (resizeTimer) {
          cancelAnimationFrame(resizeTimer);
      }
      // resizeTimer = requestAnimationFrame(fauxCart.updateTotals);
  });

// Convert price string to a floating-point number
parsePrice = function(priceStr) {

  return parseFloat(priceStr.replace(/[^\d\.]/g, ''));
}

  function updateFauxCartOnSlide(carouselIndex, activeSlide) {
    let productData = {
        productPrice: $(activeSlide).data('product-price'),
        productSalePrice: String($(activeSlide).data('product-sale-price')),
        productColor: $(activeSlide).data('product-color') || $(activeSlide).data('color'),
        productHandle: $(activeSlide).data('product-handle'), // May not be needed directly in cart update
        productId: $(activeSlide).data('product-id'),
        productTitle: $(activeSlide).data('product-title'),
        productImage: $(activeSlide).data('product-image')
    };
    fauxCart.updateCartItem(carouselIndex, productData);
}

  // Update the faux cart based on the QV
  function updateFauxCartOnQV(carouselIndex, swatch) {
    let productData = {
        productId: swatch.data('product-id'),
        productPrice: swatch.data('product-price'),
        productSalePrice: String(swatch.data('product-sale-price')),
        productColor: swatch.find('.color-swatch-color-name').text(),
        productHandle: swatch.data('product-handle'), 
        productTitle: swatch.data('product-title'),
        productImage: swatch.data('fauxcartsrcset')
    };
    fauxCart.updateCartItem(carouselIndex, productData);
}
    handleSwatchClickRefactor = function(swatchEl, isQuickview) {
      // Primary Els and Values
      let thisSwatch = $(swatchEl).find('.color-swatch');
      let thisSwatchValue = $(swatchEl).attr('data-color');
      let swatchProdHandle = $(swatchEl).attr('data-product-handle');
      // let swatchProdHandle;
      let relatedSwatches;
      let ancestorTrack;
      let rowQV;
      let gridSwatch; 
      let qvSwatchWrapper;
      let qvSwatches;
      if(isQuickview){
        let quickviewModal = $(swatchEl).closest('.hobo-go-plp__quickview-container');
        ancestorTrack = $(quickviewModal).siblings('.go-carousel');
        relatedSwatches = ancestorTrack.find('.color-swatch-container');
        rowQV = ancestorTrack.siblings('.hobo-go-plp__quickview-container');
        gridSwatch = ancestorTrack.find(`.color-swatch-container[data-product-handle="${swatchProdHandle}"`);
        qvSwatchWrapper = thisSwatch.closest('.swatches-wrapper')
      }else{
        gridSwatch = swatchEl;
        ancestorTrack = $(swatchEl).closest('.go-carousel');
        rowQV = ancestorTrack.siblings('.hobo-go-plp__quickview-container');
        qvSwatchWrapper = rowQV.find('.swatches-wrapper')
        relatedSwatches = rowQV.find('.color-swatch-container');
        qvSwatches = rowQV.find('.swatches-wrapper')
      }
      let ancestorGridItem = $(gridSwatch).closest('.grid__item');
      let gridItemSwatchlabel = ancestorGridItem.find('.label.current_color');
      let gridProdHandle = ancestorGridItem.attr('data-product-handle');
      let srcSet = $(gridSwatch).attr('data-srcset');
      let hoverSrcSet = $(gridSwatch).attr('data-hoversrcset');
      let thirdSrcSet = $(gridSwatch).attr('data-thirdsrcset');
      let fourthSrcSet = $(gridSwatch).attr('data-fourthsrcset');
      let fauxCartSrcSet = $(gridSwatch).attr('data-fauxcartsrcset');
      let prodId = $(gridSwatch).attr('data-product-id');
      let prodHandle = $(gridSwatch).attr('data-product-handle');
      let prodURL = $(gridSwatch).attr('data-product-url');
      let prodTitle = $(gridSwatch).attr('data-product-title');
      let prodDesc = ancestorGridItem.find('.description p').text();
      let productImages = $(gridSwatch).closest('.grid-product__content');
      let productPrice = $(gridSwatch).attr('data-product-price');
      let productSalePrice = $(gridSwatch).attr('data-product-sale-price');
             

      // Grid Item Secondary Els and Values
      let productLink = productImages.find('.grid-product__link');
      let productTitleLink = ancestorGridItem.find('.title-container');
      let primaryImage = productImages.find('.grid__image-ratio img');
      let hoverImage = productImages.find('.grid-product__secondary-image img');
      let parsedColor = thisSwatchValue.replace(/-/g, " ");

      // QuickView Secondary Els and Values
      let quickViewTitle = rowQV.find('.hobo-go-plp__prod-title span');
      let quickViewLink = rowQV.find('.hobo-go-plp__prod-title a');
      let quickViewDesc = rowQV.find('.hobo-go-plp__prod-desc-copy');
      let quickViewPriceCon = rowQV.find('.hobo-go-plp__prod-price');
      let quickViewImgCon = rowQV.find('.hobo-go-plp__quickview-images');
      let quickViewImgThumbs = rowQV.find('.hobo-go-plp__quickview-image-thumbs');

      // Check if clicked swatch is already the active swatch
      if (thisSwatch.hasClass('active-swatch')) {
        return
      } else {
        if(ancestorGridItem.hasClass('slick-current') || isQuickview){
          let rowId = ancestorTrack.data('row-id'); // This gets the data attribute value
          // Parse the string to an integer
          let numericRowId = parseInt(rowId, 10);
          // Subtract 1 from the parsed integer
          let updatedRowId = numericRowId - 1;
          updateFauxCartOnSlide(updatedRowId,$(swatchEl))

          // Remove active class from swatches
          let gridSwatchesContainer = $(gridSwatch).closest('.swatches-wrapper');
          let gridSwatches = gridSwatchesContainer.find('.color-swatch');

          if (gridSwatches.length > 0) {
            gridSwatches.each(function() {
              if($(this).hasClass('active-swatch')) {
                $(this).removeClass('active-swatch');
              }
            })
          }
          // Remove active class from swatches
          let qvSwatches = qvSwatchWrapper.find('.color-swatch');

          if (qvSwatches.length > 0) {
            qvSwatches.each(function() {
              if($(this).hasClass('active-swatch')) {
                $(this).removeClass('active-swatch');
              }
            })
          }
          // Add active class to clicked swatch on grid item
          thisSwatch.addClass('active-swatch');
          // Add active class to clicked swatch on QV
          if (relatedSwatches.length > 0) {
            relatedSwatches.each(function() {

              let color = $(this).attr('data-color');      
              if(color == thisSwatchValue) {
                $(this).find('.color-swatch').addClass('active-swatch');
              } else {
                $(this).find('.color-swatch').removeClass('active-swatch');
              }
            })
          }

          let numProductSalePrice = parsePrice(productSalePrice);
          let numProductPrice = parsePrice(productPrice);
          let content

          if (numProductSalePrice > 0 && numProductSalePrice < numProductPrice) {
            content = `<div class="grid-product__price"><span class="visually-hidden">Regular price</span>` +
              `<span class="grid-product__price--original">${productPrice}</span>` +
              `<span class="visually-hidden">Sale price</span>${productSalePrice}</div>`;
            let priceContainer = ancestorGridItem.find('.grid-product__price');
            priceContainer.html(content);
          } else {
            content = `<div class="grid-product__price">${productPrice}</div>`;
            let priceContainer = ancestorGridItem.find('.grid-product__price');
            priceContainer.html(content);
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

            // Slick makes duplicate grid items for smooth scrolling so this checks if duplicates exist and also updates them. 
            // Without this slider shows strange behavior due to placement of duplicates and originals along track.
            let hasMatchingHandle = ancestorTrack.find('.grid__item[data-product-handle="' + gridProdHandle + '"]');

            if (hasMatchingHandle.length > 0) {
              hasMatchingHandle.each(function() {
                let colorLabel = $(this).find('.label.current_color');
                let productImages = $(this).find('.grid-product__content');    

                let matchProductLink = productImages.find('.grid-product__link');
                let matchPrimaryImage = productImages.find('.grid__image-ratio img');
                let matchHoverImage = productImages.find('.grid-product__secondary-image img');

                $(this).attr('data-product-id', prodId);
                $(this).attr('data-product-color', parsedColor);
                $(this).attr('data-product-image', fauxCartSrcSet);
                $(this).attr('data-product-price', productPrice);
                $(this).attr('data-product-sale-price', productSalePrice);

                matchPrimaryImage.attr('srcset', srcSet);
                matchPrimaryImage.attr('data-srcset', srcSet);
                matchHoverImage.attr('srcset', hoverSrcSet);
                matchHoverImage.attr('data-srcset', hoverSrcSet);
                matchProductLink.attr('href', prodURL);
                matchProductLink.attr('title', prodTitle);
                colorLabel.text(parsedColor);
              })
            } 
          }
          // Update row QV on swatch click of grid item swatch
          rowQV.attr('data-product-handle', swatchProdHandle);
          rowQV.find('.hobo-go-plp__label-current-color').text(parsedColor);
          quickViewPriceCon.empty();
          quickViewPriceCon.html(content);
          quickViewTitle.text(prodTitle);
          if(quickViewDesc.text() == '' && quickViewDesc.text() == null){
            quickViewDesc.text(prodDesc);
          };
          quickViewLink.attr('href', prodURL);
          quickViewImgCon.find('.image-1').attr('data-src', srcSet);
          quickViewImgCon.find('.image-1').attr('src', srcSet);
          quickViewImgCon.find('.image-2').attr('data-src', hoverSrcSet);
          quickViewImgCon.find('.image-2').attr('src', hoverSrcSet);
          quickViewImgCon.find('.image-3').attr('data-src', thirdSrcSet);
          quickViewImgCon.find('.image-3').attr('src', thirdSrcSet);
          quickViewImgCon.find('.image-4').attr('data-src', fourthSrcSet);
          quickViewImgCon.find('.image-4').attr('src', fourthSrcSet);
          
          quickViewImgThumbs.find('.image-1').attr('data-src', srcSet);
          quickViewImgThumbs.find('.image-1').attr('src', srcSet);
          quickViewImgThumbs.find('.image-2').attr('data-src', hoverSrcSet);
          quickViewImgThumbs.find('.image-2').attr('src', hoverSrcSet);
          quickViewImgThumbs.find('.image-3').attr('data-src', thirdSrcSet);
          quickViewImgThumbs.find('.image-3').attr('src', thirdSrcSet);
          quickViewImgThumbs.find('.image-4').attr('data-src', fourthSrcSet);
          quickViewImgThumbs.find('.image-4').attr('src', fourthSrcSet);
        }
      }
    }




  // QuickView Content Load Function
  loadQuickViewContent = function(event, slick, currentSlide, rowID) {
    let slideIndex = currentSlide;
    let row = $('#go-row-' + rowID);
    let currentSlideEl = row.find('.grid__item[data-slick-index="' + slideIndex + '"]');
    let prodTitle = currentSlideEl.find('.title').text();
    let prodDesc = currentSlideEl.find('.description').text();
    let prodLink = currentSlideEl.find('.grid-product__link').attr('href');
    let prodHandle = currentSlideEl.attr('data-product-handle');
    let prodFeatures = currentSlideEl.find('.sib-features').clone()
    let swatches = currentSlideEl.find('.color-swatch-container');
    let prefix = currentSlideEl.find('.color-swatch-container').attr('data-product-color-prefix')
    let prodPriceContainer = currentSlideEl.find('.grid-product__price');
    let priceSpans = [];
    if (prodPriceContainer.children('span').length > 0) {
      priceSpans = prodPriceContainer.find('span');
    }
    
    let imgSpans = currentSlideEl.find('.go-quick-image');
    let swatchesArr = []
    swatches.each(function() {
      let wrapperDiv = $('<div>').append($(this).clone());
      swatchesArr.push(wrapperDiv.html());
    });

    // Gets containers where data needs to be rendered
    let carouselQuickView = row.siblings('.hobo-go-plp__quickview-container');
    let quickViewTitle = carouselQuickView.find('.hobo-go-plp__prod-title span');
    let quickViewLink = carouselQuickView.find('.hobo-go-plp__prod-title a');
    let quickViewDesc = carouselQuickView.find('.hobo-go-plp__prod-desc-copy');
    let quickViewPrice = carouselQuickView.find('.hobo-go-plp__prod-price');
    let quickViewFeatures = carouselQuickView.find('.hobo-go-plp__prod-features')
    let quickViewImgCon = carouselQuickView.find('.hobo-go-plp__quickview-images');
    let quickViewImgThumbCon = carouselQuickView.find('.hobo-go-plp__quickview-image-thumbs');
    let quickViewSwatchCon = carouselQuickView.find('.hobo-go-plp__prod-var-swatches');
    let quickViewSwatchLabel = carouselQuickView.find('.hobo-go-plp__label-current-color');
    let quickViewColorPrefix = carouselQuickView.find('.hobo-go-plp__label-prefix');

    // Appends data to relevant quickview container elements
    carouselQuickView.attr('data-product-handle', prodHandle);
    quickViewTitle.text(prodTitle);
    quickViewDesc.text(prodDesc);
    quickViewLink.attr('href', prodLink);
    quickViewFeatures.empty()
    prodFeatures.appendTo(quickViewFeatures) // Appends product features to quickview container
    quickViewSwatchCon.empty();
    swatchesArr.forEach(function(value) {
      quickViewSwatchCon.append(value);
    });
    let relatedSwatches;
      relatedSwatches = quickViewSwatchCon.find('.color-swatch-container');
    
    relatedSwatches.each(function(){
      $(this).on('click', function(){
        let $this = $(this)[0]
        handleSwatchClickRefactor($this, true)
      })
    })

    if(quickViewColorPrefix){
      quickViewColorPrefix.text(`${prefix}:  `)
    }

    let activeSwatchColor = quickViewSwatchCon.find('.active-swatch').closest('.color-swatch-container').attr('data-color');

    if(activeSwatchColor != undefined) {
      activeSwatchColor = activeSwatchColor.replace(/-/g, " ");
      quickViewSwatchLabel.text(activeSwatchColor);
    }

    quickViewPrice.empty();

    if (priceSpans.length > 0) {
      priceSpans.each(function() {
        let clonedSpan = $(this).clone();
        quickViewPrice.append(clonedSpan);
      });
    } else {
      let priceSpan = $('<span>');
      let price = prodPriceContainer.text();
      priceSpan.text(price);
      quickViewPrice.append(priceSpan);
    }

    quickViewImgCon.empty();
    quickViewImgThumbCon.empty();
    let loopIndex = 1;
    imgSpans.each(function() {
      let srcSet = $(this).data('src');
      let aspectRatio = $(this).data('aspectratio');
      let alt = $(this).attr('alt');
      let quickViewImage = $('<img>');

      quickViewImage.attr('data-src', srcSet);
      quickViewImage.attr('src', srcSet);
      quickViewImage.attr('alt', alt);
      quickViewImage.attr('data-aspectratio', aspectRatio);
      quickViewImage.addClass('quick-view-image');
      quickViewImage.addClass('image-' + loopIndex);

      quickViewImgCon.append(quickViewImage.clone());
      quickViewImgThumbCon.append(quickViewImage.clone());
      loopIndex++
      // quickViewImgMobileCon.append(quickViewImage);
    })
  }

  // Open QuickView Function
  openQuickView = function($this) {

    let carouselWrap = $this.closest('.go-carousel-wrapper');
    let carousel = carouselWrap.find('.go-carousel');
    let quickView = carousel.siblings('.hobo-go-plp__quickview-container');
    let quickViewMediaCarousel = quickView.find('.hobo-go-plp__quickview-images');
    let mediaElID = quickViewMediaCarousel.attr('id');
    let quickViewThumbsCarousel = quickView.find('.hobo-go-plp__quickview-image-thumbs');
    let mediaThumbsID = quickViewThumbsCarousel.attr('id');
    let quickViewOuter = $('<div class="quickview-outer"></div>')
    quickViewOuter.insertAfter(quickView)
    $(quickViewOuter).on('click', function(){
      closeQuickView($(this))
    })
    $('body').css('overflow', 'hidden');
    carouselWrap.addClass('qv-open');
      quickViewMediaCarousel.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: $(quickViewMediaCarousel).siblings('.go-carousel-prev-qvm'),
        nextArrow: $(quickViewMediaCarousel).siblings('.go-carousel-next-qvm'),
        infinite: false,
        autoplay: false,
        arrows: true,
        asNavFor: "#"+mediaThumbsID,
        focusOnSelect: true,
        responsive: [
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 500,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      });
      quickViewThumbsCarousel.slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        asNavFor: "#"+mediaElID,
        autoplay: false,
        dots: false,
        centerMode: false,
        infinite: false,
        focusOnSelect: true,
        arrows: false,
        vertical: true,
        verticalSwiping: true,
        responsive: [
          {
            breakpoint: 767,
            settings: {
              variableWidth: true
            }
          }
        ]
      })
  }

  // Close Quickview Function
  closeQuickView = function($this) {
    let carousel = $this.closest('.go-carousel-wrapper').find('.go-carousel');
    $('.quickview-outer').remove()
    let quickView = carousel.siblings('.hobo-go-plp__quickview-container');
    let quickViewMediaCarousel = quickView.find('.hobo-go-plp__quickview-images');
    let quickViewThumbsCarousel = quickView.find('.hobo-go-plp__quickview-image-thumbs');

    quickViewMediaCarousel.slick('unslick');
    quickViewThumbsCarousel.slick('unslick');
    $('body').css('overflow', 'unset');
    carousel.closest('.go-carousel-wrapper').removeClass('qv-open');
  }

  // Slick initialization with args and Slick slide event listeners and handlers
  $('.go-carousel').each(function(index) {
    let wrapper = $(this).parent();
    let rowID = $(this).attr('data-row-id');
    centeredArgs.nextArrow = wrapper.find('.go-carousel-next');
    centeredArgs.prevArrow = wrapper.find('.go-carousel-prev');
    
    $(this).on('init', function(event, slick) {
      let currentSlide = $(this).find('.slick-current').attr('data-slick-index');
      loadQuickViewContent(event, slick, currentSlide, rowID);
      updateFauxCartOnSlide(index, slick.$slides.get(currentSlide));
    });

    $(this).on('afterChange', function(event, slick, currentSlide){
      loadQuickViewContent(event, slick, currentSlide, rowID);
      updateFauxCartOnSlide(index, slick.$slides.get(currentSlide));
    });

    $(this).slick(centeredArgs);
  })

  // Ajax Add To Cart for desktop and mobile
  // .faux-cart__submit button
  $('.mobile-cart__atb, .faux-cart__submit button').on('click', function() {
    $(this).addClass('btn--loading');
    var itemsToAdd = $.map(fauxCart.items, function(item) {
        return {
            id: item.productId,
            quantity: 1,
            properties: {
                "_go-bundle-plp": true
            }
        };
    });

    // Add items to Shopify cart
    fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsToAdd }),
    })
    .then(response => response.json())
    .then(data => {
      document.dispatchEvent(new CustomEvent('cart:build'));
      document.dispatchEvent(new CustomEvent ('cart:open'));

    })
    .catch((error) => {
      document.addEventListener('ajaxProduct:error', function(evt) {
        console.log(evt.detail.errorMessage);
      });
    })
    .finally(() => {
      $(this).removeClass('btn--loading');
      
    });
  });

  // Grid Item Swatch click event listener and handler - to be refactored later
  $('.grid__item .color-swatch-container').each(function() {
    $(this).on('click', function() {
      let $this = $(this)
      handleSwatchClickRefactor($this, false)
     
    });
  });

  $('.quick-product__btn').each(function() {
    let $this = $(this)
    $(this).on('click', function() {
      openQuickView($this)
    });
  })

  $('.hobo-go-plp__close-btn').each(function() {
    let $this = $(this)
    $(this).on('click', function() {
      closeQuickView($this);
    })
  });

  $('.mobile-cart__close').click(function() {
      $('.mobile-cart').animate({
          height: 'toggle',
          opacity: 'toggle'
      }, 500, function() { 
          $('.mobile-go-button').slideDown();
      });
  });

$('.mobile-go-button').click(function() {
        var $button = $(this); 

        $button.animate({
            height: 'toggle',
            opacity: 'toggle'
        }, 500, function() {
            $button.hide();
            $('.mobile-cart').slideDown('slow');
            var itemCount = fauxCart.items.length;
            var newText = ' - ' + itemCount + ' styles';
            $('.mobile-cart #styleCount').text(newText); 
        });
  });

  $('.hobo-go-plp__quickview__close-x').each(function() {
    let $this = $(this)
    $(this).on('click', function() {
      closeQuickView($this)
    })
  })

})