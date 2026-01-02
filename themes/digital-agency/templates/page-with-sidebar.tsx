import * as React from 'react';
import type { ThemeTemplateProps } from '@/types';
import { Header, Footer } from '../index';

export default function PageWithSidebarTemplate(props: ThemeTemplateProps) {
  const { posts = [], post, site } = props || {};
  
  return (
    <div className="theme-page-wrapper">
      <Header {...props} />
      <div style={{ display: "none" }} className="swm-loader-holder">
    <div className="swm-loader-inner">
        <div className="swm-loader-wandering-cubes">
            <div className="swm-loader-wandering-cube-1"></div>
            <div className="swm-loader-wandering-cube-2"></div>
        </div>
    </div>
</div>
	<div id="swm-page">
		<div id="swm-outer-wrap" className="clear">
			<div id="swm-wrap" className="clear">

				<div id="smooth-wrapper" style={{ inset: "0px", width: "100%", height: "100%", position: "fixed", overflow: "hidden" }}><div id="smooth-content" style={{ translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 0px)", boxSizing: "border-box", width: "100%", overflow: "visible" }}>            
            
				<div id="content" className="swm-main-container swm-site-content swm-anim">
                    <div className="swm_site_content_wrap swm-container"></div>		<div data-elementor-type="wp-page" data-elementor-id="2342" className="elementor elementor-2342">
				<div data-id="49a10ba7" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-49a10ba7 e-con-full e-flex mk-enable-fade-animation-none e-con e-parent">
				<div data-id="406a9a2d" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_basic_slider.default" className="elementor-element elementor-element-406a9a2d mk-enable-fade-animation-none elementor-widget elementor-widget-mk_basic_slider">
				<div className="elementor-widget-container">
					<div data-options="&#123;&quot;direction&quot;:&quot;horizontal&quot;,&quot;mouseWheel&quot;:false,&quot;hoverPause&quot;:false,&quot;slidesPerView&quot;:1,&quot;slidesPerViewTablet&quot;:1,&quot;slidesPerViewMobile&quot;:1,&quot;spaceBetween&quot;:0,&quot;spaceBetweenTablet&quot;:0,&quot;spaceBetweenMobile&quot;:0,&quot;slideAnimation&quot;:&quot;slide&quot;,&quot;loop&quot;:true,&quot;autoplay&quot;:true,&quot;centeredSlides&quot;:false,&quot;speed&quot;:5000,&quot;speedAnimation&quot;:1000,&quot;unique&quot;:&quot;406a9a2d&quot;,&quot;data_id&quot;:&quot;406a9a2d&quot;,&quot;outsideNavigation&quot;:&quot;yes&quot;,&quot;outsidePagination&quot;:&quot;yes&quot;&#125;" id="swiper-406a9a2d" className="mk-basic-slider swm-swiper-container swm-ts-horizontal-yes swm-bs-effect-slide mk--drag-cursor mk-col-num--1 swiper-initialized swiper-horizontal swiper-pointer-events swiper-watch-progress swiper-backface-hidden swm-swiper--initialized">
                    <div id="swiper-wrapper-2c643e5a13289338" aria-live="off" style={{ transitionDuration: "0ms", transform: "translate3d(-800px, 0px, 0px)" }} className="swiper-wrapper"><div data-swiper-slide-index="3" style={{ width: "800px" }} role="group" aria-label="4 / 4" className="mk-swiper-item swiper-slide elementor-repeater-item-17eb30e swiper-slide-duplicate swiper-slide-prev">
                                <div className="slide-inner">
                                    <div data-swiper-parallax-x="50%" style={{ backgroundImage: "url(&quot", https: "//solis.premiumthemes.in/wp-content/uploads/2025/06/fullscren-13.jpg&quot", transitionDuration: "0ms", transform: "translate3d(50%, 0px, 0px)" }} className="mk-bs-img"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}></a></div>
                                </div>
                                <div className="mk-bs-content"><h4 className="mk-bs-title swm-hide-none"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}>Crystal Impact</a></h4><div className="mk-bs-desc swm-hide-tablet">Bellentesque in tempus sem conetur </div></div>
                            </div>
                        <div data-swiper-slide-index="0" style={{ width: "800px" }} role="group" aria-label="1 / 4" className="mk-swiper-item swiper-slide elementor-repeater-item-8f89ddb swiper-slide-visible swiper-slide-active">
                                <div className="slide-inner">
                                    <div data-swiper-parallax-x="50%" style={{ backgroundImage: "url(&quot", https: "//solis.premiumthemes.in/wp-content/uploads/2025/06/fullscren-10.jpg&quot", transitionDuration: "0ms", transform: "translate3d(0%, 0px, 0px)" }} className="mk-bs-img"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}></a></div>
                                </div>
                                <div className="mk-bs-content"><h4 className="mk-bs-title swm-hide-none"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}>Radiant Prism</a></h4><div className="mk-bs-desc swm-hide-tablet">Bellentesque in tempus sem conetur </div></div>
                            </div><div data-swiper-slide-index="1" style={{ width: "800px" }} role="group" aria-label="2 / 4" className="mk-swiper-item swiper-slide elementor-repeater-item-7a9302c swiper-slide-next">
                                <div className="slide-inner">
                                    <div data-swiper-parallax-x="50%" style={{ backgroundImage: "url(&quot", https: "//solis.premiumthemes.in/wp-content/uploads/2025/06/fullscren-12.jpg&quot", transitionDuration: "0ms", transform: "translate3d(-50%, 0px, 0px)" }} className="mk-bs-img"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}></a></div>
                                </div>
                                <div className="mk-bs-content"><h4 className="mk-bs-title swm-hide-none"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}>Eclipse Frame</a></h4><div className="mk-bs-desc swm-hide-tablet">Bellentesque in tempus sem conetur </div></div>
                            </div><div data-swiper-slide-index="2" style={{ width: "800px" }} role="group" aria-label="3 / 4" className="mk-swiper-item swiper-slide elementor-repeater-item-9ac2ee0">
                                <div className="slide-inner">
                                    <div data-swiper-parallax-x="50%" style={{ backgroundImage: "url(&quot", https: "//solis.premiumthemes.in/wp-content/uploads/2025/06/fullscren-9.jpg&quot", transitionDuration: "0ms", transform: "translate3d(-50%, 0px, 0px)" }} className="mk-bs-img"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}></a></div>
                                </div>
                                <div className="mk-bs-content"><h4 className="mk-bs-title swm-hide-none"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}>Concept Ripple</a></h4><div className="mk-bs-desc swm-hide-tablet">Bellentesque in tempus sem conetur </div></div>
                            </div><div data-swiper-slide-index="3" style={{ width: "800px" }} role="group" aria-label="4 / 4" className="mk-swiper-item swiper-slide elementor-repeater-item-17eb30e swiper-slide-duplicate-prev">
                                <div className="slide-inner">
                                    <div data-swiper-parallax-x="50%" style={{ backgroundImage: "url(&quot", https: "//solis.premiumthemes.in/wp-content/uploads/2025/06/fullscren-13.jpg&quot", transitionDuration: "0ms", transform: "translate3d(-50%, 0px, 0px)" }} className="mk-bs-img"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}></a></div>
                                </div>
                                <div className="mk-bs-content"><h4 className="mk-bs-title swm-hide-none"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}>Crystal Impact</a></h4><div className="mk-bs-desc swm-hide-tablet">Bellentesque in tempus sem conetur </div></div>
                            </div>
                    <div data-swiper-slide-index="0" role="group" aria-label="1 / 4" style={{ width: "800px" }} className="mk-swiper-item swiper-slide elementor-repeater-item-8f89ddb swiper-slide-duplicate swiper-slide-duplicate-active">
                                <div className="slide-inner">
                                    <div data-swiper-parallax-x="50%" style={{ backgroundImage: "url(&quot", https: "//solis.premiumthemes.in/wp-content/uploads/2025/06/fullscren-10.jpg&quot", transitionDuration: "0ms", transform: "translate3d(-50%, 0px, 0px)" }} className="mk-bs-img"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}></a></div>
                                </div>
                                <div className="mk-bs-content"><h4 className="mk-bs-title swm-hide-none"><a href="https://solis.premiumthemes.in/portfolio-gallery/" style={{ cursor: "pointer" }}>Radiant Prism</a></h4><div className="mk-bs-desc swm-hide-tablet">Bellentesque in tempus sem conetur </div></div>
                            </div></div>
                    <div style={{ cursor: "pointer" }} className="swiper-pagination swiper-pagination-406a9a2d swm-hide-tablet swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal"><span role="button" aria-label="Go to slide 1" aria-current="true" className="swiper-pagination-bullet swiper-pagination-bullet-active" tabIndex="0"></span><span role="button" aria-label="Go to slide 2" className="swiper-pagination-bullet" tabIndex="0"></span><span role="button" aria-label="Go to slide 3" className="swiper-pagination-bullet" tabIndex="0"></span><span role="button" aria-label="Go to slide 4" className="swiper-pagination-bullet" tabIndex="0"></span></div>
            <span aria-live="assertive" aria-atomic="true" className="swiper-notification"></span></div>				</div>
				</div>
				</div>
		<div data-id="635cb688" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-635cb688 e-con-full e-flex mk-enable-fade-animation-none e-con e-parent">
		<div data-id="70d9351b" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-70d9351b e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="38a7c049" data-element_type="widget" data-settings="&#123;&quot;mk_text_animation&quot;:&quot;text_invert&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_animated_title.default" className="elementor-element elementor-element-38a7c049 mk-t-animation-textalign-flex-start mk-t-animation-text_invert elementor-widget__width-initial mk-enable-fade-animation-none elementor-widget elementor-widget-mk_animated_title">
				<div className="elementor-widget-container">
					<div className="mk-animated-title-container mk-scroll--load">
                <div></div>
                <div><div style={{ "--mk-animated-title-text-color": "0.0, 0.0%, 0.0%" }} className="mk--animated-title"><div style={{ display: "block", textAlign: "start", position: "relative", backgroundPositionX: "100%" }} className="invert-line">We blend creativity and strategy to deliver </div><div style={{ display: "block", textAlign: "start", position: "relative", backgroundPositionX: "100%" }} className="invert-line">custom solutions that drive results and </div><div style={{ display: "block", textAlign: "start", position: "relative", backgroundPositionX: "100%" }} className="invert-line">elevate your brand</div></div></div>
            </div>				</div>
				</div>
				</div>
		<div data-id="280f9eb6" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-280f9eb6 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="758deecb" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_animated_content.default" className="elementor-element elementor-element-758deecb elementor-widget__width-initial mk-enable-fade-animation-none elementor-widget elementor-widget-mk_animated_content">
				<div className="elementor-widget-container">
					<div data-appear-delay="100" className="mk-animated-content mk-scroll--load mk--appear-from-bottom"><div className="mk-ac-title">Sed ut perspiciatis unde omnis iste natus error sit volatem accusntium doloremque laudatium, totam rem aperiam, eaque ipsa quae abillo invtore veriat etquas archiecto beatae vitae dicta sunt explicabo. </div></div>				</div>
				</div>
				<div data-id="6d684177" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_animated_content.default" className="elementor-element elementor-element-6d684177 elementor-widget__width-initial mk-enable-fade-animation-none elementor-widget elementor-widget-mk_animated_content">
				<div className="elementor-widget-container">
					<div data-appear-delay="300" className="mk-animated-content mk-scroll--load mk--appear-from-bottom"><div className="mk-ac-title">Dolor isared perspi unde omnis iste natus error sit volatem accusntium doloremque laudatium, totam rem aperiam, eaque ipsa quae abillo invtore veriat etquas archiecto beatae vitae dicta vitae dicta sunt. </div></div>				</div>
				</div>
				</div>
		<div data-id="3e939796" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-3e939796 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="3e5904f" data-element_type="container" data-settings="&#123;&quot;background_background&quot;:&quot;classic&quot;,&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;fade-offset&quot;:80,&quot;delay&quot;:0.1499999999999999944488848768742172978818416595458984375,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;&#125;" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 80px)", opacity: "0" }} className="elementor-element elementor-element-3e5904f e-con-full mk-enable-fade-animation-fade e-flex e-con e-child">
		<div data-id="3746eede" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-3746eede e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="20dad3c5" data-element_type="widget" data-settings="&#123;&quot;mk_text_animation&quot;:&quot;none&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_animated_title.default" className="elementor-element elementor-element-20dad3c5 elementor-widget__width-initial mk-t-animation-textalign-left mk-t-animation-none mk-enable-fade-animation-none elementor-widget elementor-widget-mk_animated_title">
				<div className="elementor-widget-container">
					<div className="mk-animated-title-container mk-scroll--load">
                <div></div>
                <div><div className="mk--animated-title">Initial Discovery and Insights</div></div>
            </div>				</div>
				</div>
				<div data-id="46acf90d" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="icon.default" className="elementor-element elementor-element-46acf90d elementor-view-stacked elementor-shape-circle mk-enable-fade-animation-none elementor-widget elementor-widget-icon">
				<div className="elementor-widget-container">
							<div className="elementor-icon-wrapper">
			<div className="elementor-icon">
			<svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-check"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg>			</div>
		</div>
						</div>
				</div>
				</div>
		<div data-id="30cbe306" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-30cbe306 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="3e5c1064" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_icon_list.default" className="elementor-element elementor-element-3e5c1064 mk-icon-list-traditional mk-icon-center-no mk-icon-left mk-bg-switcher-400 mk-enable-fade-animation-none elementor-widget elementor-widget-mk_icon_list">
				<div className="elementor-widget-container">
					        <div className="mk-icon-list-wrap">
            <ul className="mk-ilist-items">
                                                            <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Excepteur sinters occat </span>                        </li>
                                                                                <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Llonproident sunt in culpa </span>                        </li>
                                                                                <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Feserunt molliecat impem</span>                        </li>
                                                </ul>
        </div>
        				</div>
				</div>
				</div>
				</div>
		<div data-id="6b92b7a0" data-element_type="container" data-settings="&#123;&quot;background_background&quot;:&quot;classic&quot;,&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;delay&quot;:0.299999999999999988897769753748434595763683319091796875,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;fade-offset&quot;:70,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;&#125;" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 70px)", opacity: "0" }} className="elementor-element elementor-element-6b92b7a0 e-con-full mk-enable-fade-animation-fade e-flex e-con e-child">
		<div data-id="42c749ca" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-42c749ca e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="1c1ff160" data-element_type="widget" data-settings="&#123;&quot;mk_text_animation&quot;:&quot;none&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_animated_title.default" className="elementor-element elementor-element-1c1ff160 elementor-widget__width-initial mk-t-animation-textalign-left mk-t-animation-none mk-enable-fade-animation-none elementor-widget elementor-widget-mk_animated_title">
				<div className="elementor-widget-container">
					<div className="mk-animated-title-container mk-scroll--load">
                <div></div>
                <div><div className="mk--animated-title">Concept Building and Approval</div></div>
            </div>				</div>
				</div>
				<div data-id="1fa0a356" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="icon.default" className="elementor-element elementor-element-1fa0a356 elementor-view-stacked elementor-shape-circle mk-enable-fade-animation-none elementor-widget elementor-widget-icon">
				<div className="elementor-widget-container">
							<div className="elementor-icon-wrapper">
			<div className="elementor-icon">
			<svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-check"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg>			</div>
		</div>
						</div>
				</div>
				</div>
		<div data-id="5502271f" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-5502271f e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="2e7f8996" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_icon_list.default" className="elementor-element elementor-element-2e7f8996 mk-icon-list-traditional mk-icon-center-no mk-icon-left mk-bg-switcher-400 mk-enable-fade-animation-none elementor-widget elementor-widget-mk_icon_list">
				<div className="elementor-widget-container">
					        <div className="mk-icon-list-wrap">
            <ul className="mk-ilist-items">
                                                            <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Excepteur sinters occat </span>                        </li>
                                                                                <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Llonproident sunt in culpa </span>                        </li>
                                                                                <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Feserunt molliecat impem</span>                        </li>
                                                </ul>
        </div>
        				</div>
				</div>
				</div>
				</div>
		<div data-id="236c8725" data-element_type="container" data-settings="&#123;&quot;background_background&quot;:&quot;classic&quot;,&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;delay&quot;:0.5500000000000000444089209850062616169452667236328125,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;fade-offset&quot;:70,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;&#125;" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 70px)", opacity: "0" }} className="elementor-element elementor-element-236c8725 e-con-full mk-enable-fade-animation-fade e-flex e-con e-child">
		<div data-id="6aa9fca8" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-6aa9fca8 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="4326f752" data-element_type="widget" data-settings="&#123;&quot;mk_text_animation&quot;:&quot;none&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_animated_title.default" className="elementor-element elementor-element-4326f752 elementor-widget__width-initial mk-t-animation-textalign-left mk-t-animation-none mk-enable-fade-animation-none elementor-widget elementor-widget-mk_animated_title">
				<div className="elementor-widget-container">
					<div className="mk-animated-title-container mk-scroll--load">
                <div></div>
                <div><div className="mk--animated-title">Design Execution and Testing</div></div>
            </div>				</div>
				</div>
				<div data-id="195a96b1" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="icon.default" className="elementor-element elementor-element-195a96b1 elementor-view-stacked elementor-shape-circle mk-enable-fade-animation-none elementor-widget elementor-widget-icon">
				<div className="elementor-widget-container">
							<div className="elementor-icon-wrapper">
			<div className="elementor-icon">
			<svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-check"><path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg>			</div>
		</div>
						</div>
				</div>
				</div>
		<div data-id="b2c3f5d" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-b2c3f5d e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="35bca302" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_icon_list.default" className="elementor-element elementor-element-35bca302 mk-icon-list-traditional mk-icon-center-no mk-icon-left mk-bg-switcher-400 mk-enable-fade-animation-none elementor-widget elementor-widget-mk_icon_list">
				<div className="elementor-widget-container">
					        <div className="mk-icon-list-wrap">
            <ul className="mk-ilist-items">
                                                            <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Excepteur sinters occat </span>                        </li>
                                                                                <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Llonproident sunt in culpa </span>                        </li>
                                                                                <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Feserunt molliecat impem</span>                        </li>
                                                </ul>
        </div>
        				</div>
				</div>
				</div>
				</div>
		<div data-id="3c8287a7" data-element_type="container" data-settings="&#123;&quot;background_background&quot;:&quot;classic&quot;,&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;delay&quot;:0.6999999999999999555910790149937383830547332763671875,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;fade-offset&quot;:70,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;&#125;" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 70px)", opacity: "0" }} className="elementor-element elementor-element-3c8287a7 e-con-full mk-enable-fade-animation-fade e-flex e-con e-child">
		<div data-id="92b9ca5" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-92b9ca5 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="59cd5a67" data-element_type="widget" data-settings="&#123;&quot;mk_text_animation&quot;:&quot;none&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_animated_title.default" className="elementor-element elementor-element-59cd5a67 elementor-widget__width-initial mk-t-animation-textalign-left mk-t-animation-none mk-enable-fade-animation-none elementor-widget elementor-widget-mk_animated_title">
				<div className="elementor-widget-container">
					<div className="mk-animated-title-container mk-scroll--load">
                <div></div>
                <div><div className="mk--animated-title">Client Approval and Go Live</div></div>
            </div>				</div>
				</div>
				<div data-id="5c6acb37" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="icon.default" className="elementor-element elementor-element-5c6acb37 elementor-view-stacked elementor-shape-circle mk-enable-fade-animation-none elementor-widget elementor-widget-icon">
				<div className="elementor-widget-container">
							<div className="elementor-icon-wrapper">
			<div className="elementor-icon">
			<svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-certificate"><path d="M458.622 255.92l45.985-45.005c13.708-12.977 7.316-36.039-10.664-40.339l-62.65-15.99 17.661-62.015c4.991-17.838-11.829-34.663-29.661-29.671l-61.994 17.667-15.984-62.671C337.085.197 313.765-6.276 300.99 7.228L256 53.57 211.011 7.229c-12.63-13.351-36.047-7.234-40.325 10.668l-15.984 62.671-61.995-17.667C74.87 57.907 58.056 74.738 63.046 92.572l17.661 62.015-62.65 15.99C.069 174.878-6.31 197.944 7.392 210.915l45.985 45.005-45.985 45.004c-13.708 12.977-7.316 36.039 10.664 40.339l62.65 15.99-17.661 62.015c-4.991 17.838 11.829 34.663 29.661 29.671l61.994-17.667 15.984 62.671c4.439 18.575 27.696 24.018 40.325 10.668L256 458.61l44.989 46.001c12.5 13.488 35.987 7.486 40.325-10.668l15.984-62.671 61.994 17.667c17.836 4.994 34.651-11.837 29.661-29.671l-17.661-62.015 62.65-15.99c17.987-4.302 24.366-27.367 10.664-40.339l-45.984-45.004z"></path></svg>			</div>
		</div>
						</div>
				</div>
				</div>
		<div data-id="bcbf995" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-bcbf995 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="6f59b4f2" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_icon_list.default" className="elementor-element elementor-element-6f59b4f2 mk-icon-list-traditional mk-icon-center-no mk-icon-left mk-bg-switcher-400 mk-enable-fade-animation-none elementor-widget elementor-widget-mk_icon_list">
				<div className="elementor-widget-container">
					        <div className="mk-icon-list-wrap">
            <ul className="mk-ilist-items">
                                                            <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Excepteur sinters occat </span>                        </li>
                                                                                <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Llonproident sunt in culpa </span>                        </li>
                                                                                <li>
                                                                <span className="mk-icon-wrapper">
                                                                                        <span className="mk-icon-list-icon mk-icon "><svg aria-hidden="true" viewBox="0 0 512 512" className="e-font-icon-svg e-fas-circle"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"></path></svg></span>
												                                    </span>
                                    <span className="mk-icon-list-text">Feserunt molliecat impem</span>                        </li>
                                                </ul>
        </div>
        				</div>
				</div>
				</div>
				</div>
				</div>
		<div data-id="524bc6d1" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-524bc6d1 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="271a7bca" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;fade-offset&quot;:70,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;delay&quot;:0.1499999999999999944488848768742172978818416595458984375,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;&#125;" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 70px)", opacity: "0" }} className="elementor-element elementor-element-271a7bca e-con-full mk-enable-fade-animation-fade e-flex e-con e-child">
				<div data-id="41c1e2fd" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_service_list_simple.default" className="elementor-element elementor-element-41c1e2fd mk-enable-fade-animation-none elementor-widget elementor-widget-mk_service_list_simple">
				<div className="elementor-widget-container">
					<div className="mk-service-list-simple"><div className="mk-service-list-simple-item"><a href="https://solis.premiumthemes.in/our-services/"></a><p className="mk-service-list-simple-title swm-hide-none"><span>01</span>Website Designing</p><div className="mk-service-list-simple-arrow swm-hide-none"><svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow-alt swm-svg-services-list-simple-arrow"><path d="M12 2.5C12 2.5 12.831 6.34707 14.75 8C16.1398 9.19711 18 9.5 18 9.5M12 2.5C12 2.5 11.1691 6.34707 9.25 8C7.86016 9.19711 6 9.5 6 9.5M12 2.5L12 21.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square"></path></svg></div></div><div className="mk-service-list-simple-item"><a href="https://solis.premiumthemes.in/our-services/"></a><p className="mk-service-list-simple-title swm-hide-none"><span>02</span>Mobile Applications</p><div className="mk-service-list-simple-arrow swm-hide-none"><svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow-alt swm-svg-services-list-simple-arrow"><path d="M12 2.5C12 2.5 12.831 6.34707 14.75 8C16.1398 9.19711 18 9.5 18 9.5M12 2.5C12 2.5 11.1691 6.34707 9.25 8C7.86016 9.19711 6 9.5 6 9.5M12 2.5L12 21.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square"></path></svg></div></div><div className="mk-service-list-simple-item"><a href="https://solis.premiumthemes.in/our-services/"></a><p className="mk-service-list-simple-title swm-hide-none"><span>03</span>Brand Development</p><div className="mk-service-list-simple-arrow swm-hide-none"><svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow-alt swm-svg-services-list-simple-arrow"><path d="M12 2.5C12 2.5 12.831 6.34707 14.75 8C16.1398 9.19711 18 9.5 18 9.5M12 2.5C12 2.5 11.1691 6.34707 9.25 8C7.86016 9.19711 6 9.5 6 9.5M12 2.5L12 21.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square"></path></svg></div></div></div>				</div>
				</div>
				</div>
		<div data-id="148a6e8a" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;fade-offset&quot;:70,&quot;delay&quot;:0.299999999999999988897769753748434595763683319091796875,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;&#125;" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 70px)", opacity: "0" }} className="elementor-element elementor-element-148a6e8a e-con-full mk-enable-fade-animation-fade e-flex e-con e-child">
				<div data-id="550a5ef2" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_service_list_simple.default" className="elementor-element elementor-element-550a5ef2 mk-enable-fade-animation-none elementor-widget elementor-widget-mk_service_list_simple">
				<div className="elementor-widget-container">
					<div className="mk-service-list-simple"><div className="mk-service-list-simple-item"><a href="https://solis.premiumthemes.in/our-services/"></a><p className="mk-service-list-simple-title swm-hide-none"><span>04</span>Social Media Growth</p><div className="mk-service-list-simple-arrow swm-hide-none"><svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow-alt swm-svg-services-list-simple-arrow"><path d="M12 2.5C12 2.5 12.831 6.34707 14.75 8C16.1398 9.19711 18 9.5 18 9.5M12 2.5C12 2.5 11.1691 6.34707 9.25 8C7.86016 9.19711 6 9.5 6 9.5M12 2.5L12 21.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square"></path></svg></div></div><div className="mk-service-list-simple-item"><a href="https://solis.premiumthemes.in/our-services/"></a><p className="mk-service-list-simple-title swm-hide-none"><span>05</span>Marketing Campaigns</p><div className="mk-service-list-simple-arrow swm-hide-none"><svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow-alt swm-svg-services-list-simple-arrow"><path d="M12 2.5C12 2.5 12.831 6.34707 14.75 8C16.1398 9.19711 18 9.5 18 9.5M12 2.5C12 2.5 11.1691 6.34707 9.25 8C7.86016 9.19711 6 9.5 6 9.5M12 2.5L12 21.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square"></path></svg></div></div><div className="mk-service-list-simple-item"><a href="https://solis.premiumthemes.in/our-services/"></a><p className="mk-service-list-simple-title swm-hide-none"><span>06</span>Product Photography</p><div className="mk-service-list-simple-arrow swm-hide-none"><svg width="24" height="24" viewBox="0 0 24 24" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow-alt swm-svg-services-list-simple-arrow"><path d="M12 2.5C12 2.5 12.831 6.34707 14.75 8C16.1398 9.19711 18 9.5 18 9.5M12 2.5C12 2.5 11.1691 6.34707 9.25 8C7.86016 9.19711 6 9.5 6 9.5M12 2.5L12 21.5" stroke="currentColor" strokeWidth="1" strokeLinecap="square"></path></svg></div></div></div>				</div>
				</div>
				</div>
				</div>
		<div data-id="57595b96" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-57595b96 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="293435cd" data-element_type="widget" data-settings="&#123;&quot;mk_text_animation&quot;:&quot;text_reveal&quot;,&quot;text_delay&quot;:0.1499999999999999944488848768742172978818416595458984375,&quot;text_duration&quot;:1,&quot;text_stagger&quot;:0.0200000000000000004163336342344337026588618755340576171875,&quot;text_on_scroll&quot;:&quot;yes&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_animated_title.default" className="elementor-element elementor-element-293435cd mk-t-animation-textalign-flex-start mk-t-animation-text_reveal elementor-widget__width-initial mk-enable-fade-animation-none elementor-widget elementor-widget-mk_animated_title">
				<div className="elementor-widget-container">
					<div className="mk-animated-title-container mk-scroll--load">
                <div><div className="mk--animated-title-overlay-tag swm-hide-none">Awards</div></div>
                <div><h2 style={{}} className="mk--animated-title"><div style={{ display: "block", textAlign: "start", position: "relative" }} className="mk-anim-reveal-line"><div style={{ position: "relative", display: "inline-block" }}><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>W</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>h</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>a</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>t</div></div> <div style={{ position: "relative", display: "inline-block" }}><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>W</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>e</div></div> </div><div style={{ display: "block", textAlign: "start", position: "relative" }} className="mk-anim-reveal-line"><div style={{ position: "relative", display: "inline-block" }}><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>A</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>c</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>h</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>i</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>e</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>v</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>e</div><div style={{ position: "relative", display: "inline-block", translate: "none", rotate: "none", scale: "none", opacity: "0", transform: "translate(0px, 80px)" }}>d</div></div></div></h2></div>
            </div>				</div>
				</div>
				<div data-id="6d8dd4c7" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_animated_content.default" className="elementor-element elementor-element-6d8dd4c7 elementor-widget__width-initial mk-enable-fade-animation-none elementor-widget elementor-widget-mk_animated_content">
				<div className="elementor-widget-container">
					<div data-appear-delay="400" className="mk-animated-content mk-scroll--load mk--appear-from-bottom"><div className="mk-ac-title">From concept to execution, our team’s work has been honored with numerous awards for creative brilliance.</div></div>				</div>
				</div>
				</div>
		<div data-id="56590c88" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-56590c88 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="51688891" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-51688891 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="5b897074" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-5b897074 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="433c2d6c" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-433c2d6c mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<h2 className="elementor-heading-title elementor-size-default">2020</h2>				</div>
				</div>
				<div data-id="69300208" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-69300208 mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<span className="elementor-heading-title elementor-size-default">Design Award</span>				</div>
				</div>
				</div>
		<div data-id="c4f627e" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-c4f627e e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="3b7ce2b6" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_image.default" className="elementor-element elementor-element-3b7ce2b6 mk-custom-image-appear-reveal mk-enable-fade-animation-none elementor-widget elementor-widget-mk_image">
				<div className="elementor-widget-container">
					
        <div className="mk-image">
            <div className="mk-image-wrapper swm-anim align-items-center">

                    
                    <figure data-reveal-color="#ffffff" data-reveal-direction="tb" data-reveal-duration="600" data-reveal-delay="0" data-reveal-viewport="90" className="swm-anim block-revealer"><div style={{ opacity: "0" }} className="block-revealer__content">

                    <img decoding="async" width="750" height="692" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-1.jpg" alt="" sizes="(max-width: 750px) 100vw, 750px" className="attachment-full size-full" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-1.jpg 750w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-1-300x277.jpg 300w" />
                    </div><div style={{ position: "absolute", top: "0%", left: "0%", color: "rgb(255, 255, 255)", width: "100%", height: "100%", backgroundColor: "rgb(255, 255, 255)", opacity: "0", pointerEvents: "none", zIndex: "0" }} className="block-revealer__element"></div></figure>

            </div>

        </div> 

        				</div>
				</div>
				</div>
				</div>
		<div data-id="6129435f" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-6129435f e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="45cf9f7c" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-45cf9f7c e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="5fd68a78" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-5fd68a78 mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<h2 className="elementor-heading-title elementor-size-default">2022</h2>				</div>
				</div>
				<div data-id="52db3ccd" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-52db3ccd mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<span className="elementor-heading-title elementor-size-default">Crown Digital</span>				</div>
				</div>
				</div>
		<div data-id="f01542c" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-f01542c e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="284b4468" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_image.default" className="elementor-element elementor-element-284b4468 mk-custom-image-appear-reveal mk-enable-fade-animation-none elementor-widget elementor-widget-mk_image">
				<div className="elementor-widget-container">
					
        <div className="mk-image">
            <div className="mk-image-wrapper swm-anim align-items-center">

                    
                    <figure data-reveal-color="#ffffff" data-reveal-direction="tb" data-reveal-duration="600" data-reveal-delay="0" data-reveal-viewport="90" className="swm-anim block-revealer"><div style={{ opacity: "0" }} className="block-revealer__content">

                    <img decoding="async" width="750" height="1038" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-2.jpg" alt="" sizes="(max-width: 750px) 100vw, 750px" className="attachment-full size-full" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-2.jpg 750w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-2-217x300.jpg 217w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-2-740x1024.jpg 740w" />
                    </div><div style={{ position: "absolute", top: "0%", left: "0%", color: "rgb(255, 255, 255)", width: "100%", height: "100%", backgroundColor: "rgb(255, 255, 255)", opacity: "0", pointerEvents: "none", zIndex: "0" }} className="block-revealer__element"></div></figure>

            </div>

        </div> 

        				</div>
				</div>
				</div>
				</div>
		<div data-id="7038de55" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-7038de55 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="2618b1fc" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-2618b1fc e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="2d8cc45f" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-2d8cc45f mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<h2 className="elementor-heading-title elementor-size-default">2023</h2>				</div>
				</div>
				<div data-id="6730ecbf" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-6730ecbf mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<span className="elementor-heading-title elementor-size-default">Best Design</span>				</div>
				</div>
				</div>
		<div data-id="19d7868" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-19d7868 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="6050daec" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_image.default" className="elementor-element elementor-element-6050daec mk-custom-image-appear-reveal mk-enable-fade-animation-none elementor-widget elementor-widget-mk_image">
				<div className="elementor-widget-container">
					
        <div className="mk-image">
            <div className="mk-image-wrapper swm-anim align-items-center">

                    
                    <figure data-reveal-color="#ffffff" data-reveal-direction="tb" data-reveal-duration="600" data-reveal-delay="0" data-reveal-viewport="90" className="swm-anim block-revealer"><div style={{ opacity: "0" }} className="block-revealer__content">

                    <img loading="lazy" decoding="async" width="750" height="1385" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-3.jpg" alt="" sizes="auto, (max-width: 750px) 100vw, 750px" className="attachment-full size-full" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-3.jpg 750w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-3-162x300.jpg 162w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-3-555x1024.jpg 555w" />
                    </div><div style={{ position: "absolute", top: "0%", left: "0%", color: "rgb(255, 255, 255)", width: "100%", height: "100%", backgroundColor: "rgb(255, 255, 255)", opacity: "0", pointerEvents: "none", zIndex: "0" }} className="block-revealer__element"></div></figure>

            </div>

        </div> 

        				</div>
				</div>
				</div>
				</div>
		<div data-id="1126d76f" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-1126d76f e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="2a969586" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-2a969586 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="4ab05127" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-4ab05127 mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<h2 className="elementor-heading-title elementor-size-default">2024</h2>				</div>
				</div>
				<div data-id="1d97d7db" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-1d97d7db mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<span className="elementor-heading-title elementor-size-default">Best Website</span>				</div>
				</div>
				</div>
		<div data-id="1874d7ae" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-1874d7ae e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="61956198" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_image.default" className="elementor-element elementor-element-61956198 mk-custom-image-appear-reveal mk-enable-fade-animation-none elementor-widget elementor-widget-mk_image">
				<div className="elementor-widget-container">
					
        <div className="mk-image">
            <div className="mk-image-wrapper swm-anim align-items-center">

                    
                    <figure data-reveal-color="#ffffff" data-reveal-direction="tb" data-reveal-duration="600" data-reveal-delay="0" data-reveal-viewport="90" className="swm-anim block-revealer"><div style={{ opacity: "0" }} className="block-revealer__content">

                    <img loading="lazy" decoding="async" width="750" height="1731" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-4.jpg" alt="" sizes="auto, (max-width: 750px) 100vw, 750px" className="attachment-full size-full" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-4.jpg 750w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-4-130x300.jpg 130w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-4-444x1024.jpg 444w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-4-666x1536.jpg 666w" />
                    </div><div style={{ position: "absolute", top: "0%", left: "0%", color: "rgb(255, 255, 255)", width: "100%", height: "100%", backgroundColor: "rgb(255, 255, 255)", opacity: "0", pointerEvents: "none", zIndex: "0" }} className="block-revealer__element"></div></figure>

            </div>

        </div> 

        				</div>
				</div>
				</div>
				</div>
		<div data-id="727e2da1" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-727e2da1 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="7aea9fef" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-7aea9fef e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="38fd5ad5" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-38fd5ad5 mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<h2 className="elementor-heading-title elementor-size-default">2025</h2>				</div>
				</div>
				<div data-id="429d6873" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="heading.default" className="elementor-element elementor-element-429d6873 mk-enable-fade-animation-none elementor-widget elementor-widget-heading">
				<div className="elementor-widget-container">
					<span className="elementor-heading-title elementor-size-default">Digital Infinity</span>				</div>
				</div>
				</div>
		<div data-id="56876e32" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-56876e32 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="32ab3a1e" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_image.default" className="elementor-element elementor-element-32ab3a1e mk-custom-image-appear-reveal mk-enable-fade-animation-none elementor-widget elementor-widget-mk_image">
				<div className="elementor-widget-container">
					
        <div className="mk-image">
            <div className="mk-image-wrapper swm-anim align-items-center">

                    
                    <figure data-reveal-color="#ffffff" data-reveal-direction="tb" data-reveal-duration="600" data-reveal-delay="0" data-reveal-viewport="90" className="swm-anim block-revealer"><div style={{ opacity: "0" }} className="block-revealer__content">

                    <img loading="lazy" decoding="async" width="750" height="2077" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-5.jpg" alt="" sizes="auto, (max-width: 750px) 100vw, 750px" className="attachment-full size-full" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-5.jpg 750w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-5-108x300.jpg 108w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-5-370x1024.jpg 370w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-5-555x1536.jpg 555w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/award-5-740x2048.jpg 740w" />
                    </div><div style={{ position: "absolute", top: "0%", left: "0%", color: "rgb(255, 255, 255)", width: "100%", height: "100%", backgroundColor: "rgb(255, 255, 255)", opacity: "0", pointerEvents: "none", zIndex: "0" }} className="block-revealer__element"></div></figure>

            </div>

        </div> 

        				</div>
				</div>
				</div>
				</div>
				</div>
				</div>
		<div data-id="3a779aad" data-element_type="container" data-settings="&#123;&quot;background_background&quot;:&quot;classic&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-3a779aad e-grid e-con-full mk-enable-fade-animation-none e-con e-parent">
				<div data-id="386925c4" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;fade-from&quot;:&quot;in&quot;,&quot;delay&quot;:0.1499999999999999944488848768742172978818416595458984375,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;,&quot;fade-offset&quot;:50,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="image.default" style={{ transition: "none", opacity: "0" }} className="elementor-element elementor-element-386925c4 mk-enable-fade-animation-fade elementor-widget elementor-widget-image">
				<div className="elementor-widget-container">
																<a href="#">
							<img loading="lazy" decoding="async" width="500" height="300" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo3.jpg" alt="" sizes="auto, (max-width: 500px) 100vw, 500px" className="attachment-full size-full wp-image-2073" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo3.jpg 500w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo3-300x180.jpg 300w" />								</a>
															</div>
				</div>
				<div data-id="1557ebd9" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;delay&quot;:0.299999999999999988897769753748434595763683319091796875,&quot;fade-from&quot;:&quot;in&quot;,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;,&quot;fade-offset&quot;:50,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="image.default" style={{ transition: "none", opacity: "0" }} className="elementor-element elementor-element-1557ebd9 mk-enable-fade-animation-fade elementor-widget elementor-widget-image">
				<div className="elementor-widget-container">
																<a href="#">
							<img loading="lazy" decoding="async" width="500" height="300" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo2.jpg" alt="" sizes="auto, (max-width: 500px) 100vw, 500px" className="attachment-full size-full wp-image-2072" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo2.jpg 500w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo2-300x180.jpg 300w" />								</a>
															</div>
				</div>
				<div data-id="152cdd2a" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;delay&quot;:0.450000000000000011102230246251565404236316680908203125,&quot;fade-from&quot;:&quot;in&quot;,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;,&quot;fade-offset&quot;:50,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="image.default" style={{ transition: "none", opacity: "0" }} className="elementor-element elementor-element-152cdd2a mk-enable-fade-animation-fade elementor-widget elementor-widget-image">
				<div className="elementor-widget-container">
																<a href="#">
							<img loading="lazy" decoding="async" width="500" height="300" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo4.jpg" alt="" sizes="auto, (max-width: 500px) 100vw, 500px" className="attachment-full size-full wp-image-2074" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo4.jpg 500w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo4-300x180.jpg 300w" />								</a>
															</div>
				</div>
				<div data-id="652ec911" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;delay&quot;:0.6999999999999999555910790149937383830547332763671875,&quot;fade-from&quot;:&quot;in&quot;,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;,&quot;fade-offset&quot;:50,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="image.default" style={{ transition: "none", opacity: "0" }} className="elementor-element elementor-element-652ec911 mk-enable-fade-animation-fade elementor-widget elementor-widget-image">
				<div className="elementor-widget-container">
																<a href="#">
							<img loading="lazy" decoding="async" width="500" height="300" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo1.jpg" alt="" sizes="auto, (max-width: 500px) 100vw, 500px" className="attachment-full size-full wp-image-2071" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo1.jpg 500w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo1-300x180.jpg 300w" />								</a>
															</div>
				</div>
				<div data-id="4afe6947" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;delay&quot;:0.84999999999999997779553950749686919152736663818359375,&quot;fade-from&quot;:&quot;in&quot;,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;,&quot;fade-offset&quot;:50,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="image.default" style={{ transition: "none", opacity: "0" }} className="elementor-element elementor-element-4afe6947 mk-enable-fade-animation-fade elementor-widget elementor-widget-image">
				<div className="elementor-widget-container">
																<a href="#">
							<img loading="lazy" decoding="async" width="500" height="300" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo5.jpg" alt="" sizes="auto, (max-width: 500px) 100vw, 500px" className="attachment-full size-full wp-image-2075" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo5.jpg 500w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo5-300x180.jpg 300w" />								</a>
															</div>
				</div>
				</div>
		<div data-id="1b1906ec" data-element_type="container" data-settings="&#123;&quot;background_background&quot;:&quot;classic&quot;,&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;delay&quot;:0.1499999999999999944488848768742172978818416595458984375,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;,&quot;fade-offset&quot;:50&#125;" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 50px)", opacity: "0" }} className="elementor-element elementor-element-1b1906ec e-con-full mk-enable-fade-animation-fade e-flex e-con e-parent">
		<div data-id="5f12cc84" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-5f12cc84 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="f0942b1" data-element_type="container" data-settings="&#123;&quot;mk_enable_pin_area&quot;:&quot;yes&quot;,&quot;mk_pin_breakpoint&quot;:&quot;tablet&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_pin_area_start&quot;:&quot;top top&quot;,&quot;mk_pin_area_end&quot;:&quot;bottom top&quot;&#125;" className="elementor-element elementor-element-f0942b1 e-con-full mk-enable-pin-area-yes e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="356edd0" data-element_type="container" data-settings="&#123;&quot;background_background&quot;:&quot;classic&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-356edd0 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="79e392a9" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_title.default" className="elementor-element elementor-element-79e392a9 mk-title-align--left mk-enable-fade-animation-none elementor-widget elementor-widget-mk_title">
				<div className="elementor-widget-container">
					<div className="mk-title mk-title-default"><div className="mk-title-heading swm-hide-none"><span>Let’s Converse</span></div><div className="mk-title-desc swm-hide-none"><span>Duis aute irure dolines rerepro hendit inolua sint aecat impete irure dolor ines repinolua sint.</span></div></div>				</div>
				</div>
				<div data-id="1b8463b" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;on-scroll&quot;:&quot;1&quot;,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;delay&quot;:0.1499999999999999944488848768742172978818416595458984375,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;,&quot;fade-offset&quot;:50,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_button.default" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 50px)", opacity: "0" }} className="elementor-element elementor-element-1b8463b mk-enable-fade-animation-fade mk-button-align-left elementor-widget elementor-widget-mk_button">
				<div className="elementor-widget-container">
					<a href="https://solis.premiumthemes.in/contacts/" className="mk-button"><span className="mk-button-text">start  Now</span></a>				</div>
				</div>
				</div>
				</div>
				</div>
		<div data-id="7798baec" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-7798baec e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				</div>
				</div>
		<div data-id="7a21b79a" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-7a21b79a e-con-full e-flex mk-enable-fade-animation-none e-con e-parent">
				<div data-id="4bc3676" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_title.default" className="elementor-element elementor-element-4bc3676 mk-title-align--left mk-enable-fade-animation-none elementor-widget elementor-widget-mk_title">
				<div className="elementor-widget-container">
					<div className="mk-title mk-title-default mk-scroll--load"><h2 className="mk-title-heading swm-hide-none"><span>Latest News</span></h2></div>				</div>
				</div>
				<div data-id="2c778e1f" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;on-scroll&quot;:&quot;1&quot;,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;delay&quot;:0.1499999999999999944488848768742172978818416595458984375,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;,&quot;fade-offset&quot;:50,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="text-editor.default" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 50px)", opacity: "0" }} className="elementor-element elementor-element-2c778e1f elementor-widget__width-initial mk-enable-fade-animation-fade elementor-widget elementor-widget-text-editor">
				<div className="elementor-widget-container">
									<p>Get the latest news, trends, and updates to help you stay inspired, competitive, and ahead of the market changes</p>								</div>
				</div>
				</div>
		<div data-id="81b1bd" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-81b1bd e-con-full e-flex mk-enable-fade-animation-none e-con e-parent">
				<div data-id="610d1a6" data-element_type="widget" data-settings="&#123;&quot;columns_laptop&quot;:&quot;3&quot;,&quot;mk-animation-effect&quot;:&quot;fade&quot;,&quot;fade-from&quot;:&quot;bottom&quot;,&quot;columns&quot;:&quot;3&quot;,&quot;columns_tablet&quot;:&quot;2&quot;,&quot;columns_mobile&quot;:&quot;1&quot;,&quot;delay&quot;:0.1499999999999999944488848768742172978818416595458984375,&quot;on-scroll&quot;:1,&quot;data-duration&quot;:1.5,&quot;ease&quot;:&quot;power2.out&quot;,&quot;fade-offset&quot;:50,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_blog_posts.default" style={{ transition: "none", translate: "none", rotate: "none", scale: "none", transform: "translate(0px, 50px)", opacity: "0" }} className="elementor-element elementor-element-610d1a6 elementor-grid-laptop-3 mk-post-image-zoom-yes mk-enable-fade-animation-fade elementor-grid-3 elementor-grid-tablet-2 elementor-grid-mobile-1 elementor-widget elementor-widget-mk_blog_posts">
				<div className="elementor-widget-container">
					<div data-options="&#123;&quot;post_type&quot;:&quot;post&quot;,&quot;next_page&quot;:&quot;2&quot;,&quot;max_pages_num&quot;:4,&quot;masonry_on&quot;:&quot;no&quot;,&quot;enable_filter&quot;:&quot;no&quot;,&quot;pagination_type&quot;:&quot;no-pagination&quot;,&quot;title_tag&quot;:&quot;h3&quot;,&quot;title_length&quot;:100,&quot;show_metas&quot;:&quot;yes&quot;,&quot;show_date&quot;:&quot;yes&quot;,&quot;show_author&quot;:&quot;yes&quot;,&quot;show_category&quot;:&quot;over&quot;,&quot;show_image&quot;:&quot;yes&quot;,&quot;post_img_size&quot;:&quot;full&quot;,&quot;display_style&quot;:&quot;st1&quot;,&quot;meta_position&quot;:&quot;above_title&quot;,&quot;taxonomy_filter&quot;:&quot;category&quot;,&quot;orderby&quot;:&quot;date&quot;,&quot;order&quot;:&quot;DESC&quot;,&quot;posts_per_page&quot;:3&#125;" className="mk-p-grid mk--no-bottom-space mk-pagination--off">
    
    <p className="mk-pagination-spinner mk-filter-pagination-spinner"><i className="fas fa-spinner"></i></p>
    
    <div className="mk-grid-inner clear">
        <article className="mk-grid-item mk-grid-item-wrap mk-item--full post-2247 post type-post status-publish format-standard has-post-thumbnail hentry category-artworks tag-artsy tag-studio tag-visuals">    <div className="mk-post-wrap mk-post-date-on">
    	<div className="mk-post-image"><div className="mk-post-image-category"><a href="https://solis.premiumthemes.in/category/artworks/" rel="tag">Artworks</a></div>
                                    <a href="https://solis.premiumthemes.in/the-future-of-remote-work/" className="mk-post-grid-image swm-anim"><img loading="lazy" decoding="async" width="1034" height="639" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13.jpg" alt="" sizes="auto, (max-width: 1034px) 100vw, 1034px" className="attachment-full size-full" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13.jpg 1034w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13-300x185.jpg 300w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13-1024x633.jpg 1024w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-13-768x475.jpg 768w" /></a>
                                </div>
    		<div className="mk-post-content">

                <div className="mk-post-meta highlight-text"><a href="https://solis.premiumthemes.in/2025/06/" className="entry-date mk-post-date-list published updated">June 30, 2025</a><div className="mk-post-date-list-separator mk-post-meta-separator"></div><a href="https://solis.premiumthemes.in/author/rubygates25/" className="swm-info-author">Ruby Gates</a><div className="mk-post-meta-separator"></div></div><h3 className="mk_post_title"><a href="https://solis.premiumthemes.in/the-future-of-remote-work/">The Future of Remote Work</a></h3>
            </div>
    </div>
</article><article className="mk-grid-item mk-grid-item-wrap mk-item--full post-2246 post type-post status-publish format-standard has-post-thumbnail hentry category-photography tag-craft tag-graphics tag-prints">    <div className="mk-post-wrap mk-post-date-on">
    	<div className="mk-post-image"><div className="mk-post-image-category"><a href="https://solis.premiumthemes.in/category/photography/" rel="tag">Photography</a></div>
                                    <a href="https://solis.premiumthemes.in/overcome-creative-blocks/" className="mk-post-grid-image swm-anim"><img loading="lazy" decoding="async" width="1034" height="639" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-5.jpg" alt="" sizes="auto, (max-width: 1034px) 100vw, 1034px" className="attachment-full size-full" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-5.jpg 1034w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-5-300x185.jpg 300w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-5-1024x633.jpg 1024w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-5-768x475.jpg 768w" /></a>
                                </div>
    		<div className="mk-post-content">

                <div className="mk-post-meta highlight-text"><a href="https://solis.premiumthemes.in/2025/06/" className="entry-date mk-post-date-list published updated">June 30, 2025</a><div className="mk-post-date-list-separator mk-post-meta-separator"></div><a href="https://solis.premiumthemes.in/author/rubygates25/" className="swm-info-author">Ruby Gates</a><div className="mk-post-meta-separator"></div></div><h3 className="mk_post_title"><a href="https://solis.premiumthemes.in/overcome-creative-blocks/">Overcome Creative Blocks</a></h3>
            </div>
    </div>
</article><article className="mk-grid-item mk-grid-item-wrap mk-item--full post-2245 post type-post status-publish format-standard has-post-thumbnail hentry category-visuals tag-styles tag-trendy tag-works">    <div className="mk-post-wrap mk-post-date-on">
    	<div className="mk-post-image"><div className="mk-post-image-category"><a href="https://solis.premiumthemes.in/category/visuals/" rel="tag">Visuals</a></div>
                                    <a href="https://solis.premiumthemes.in/focus-on-what-matters-most/" className="mk-post-grid-image swm-anim"><img loading="lazy" decoding="async" width="1034" height="639" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-9.jpg" alt="" sizes="auto, (max-width: 1034px) 100vw, 1034px" className="attachment-full size-full" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-9.jpg 1034w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-9-300x185.jpg 300w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-9-1024x633.jpg 1024w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/blog-9-768x475.jpg 768w" /></a>
                                </div>
    		<div className="mk-post-content">

                <div className="mk-post-meta highlight-text"><a href="https://solis.premiumthemes.in/2025/06/" className="entry-date mk-post-date-list published updated">June 30, 2025</a><div className="mk-post-date-list-separator mk-post-meta-separator"></div><a href="https://solis.premiumthemes.in/author/rubygates25/" className="swm-info-author">Ruby Gates</a><div className="mk-post-meta-separator"></div></div><h3 className="mk_post_title"><a href="https://solis.premiumthemes.in/focus-on-what-matters-most/">Focus on What Matters Most</a></h3>
            </div>
    </div>
</article>    </div>

    </div>				</div>
				</div>
				</div>
				</div>
		
		<div className="clear"></div>
	</div> 

                                
                        </div></div>
		</div>
	</div>

            <div className="swm-btt-btn">
            <span className="swm-btt-btn-icon"><svg viewBox="0 0 37 38.1" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--angle-arrow swm-svg-btt-btn-arrow"><path d="M35.5 18.5C29.3333 17.1667 17 11.6 17 0" strokeWidth="3.5"></path><path d="M35.5 18.5C29.3333 19.6667 17 25 17 37" strokeWidth="3.5"></path></svg></span>
        </div>
	<div className="mk-off-canvas-overlay mk-off-canvas-overlay-fade-in mk-off-canvas-id-446fcfe9 inited"></div>
		<div data-esckey="yes" data-offcanvas-id="51640" data-widget-id="446fcfe9" id="51640" className="mk-off-canvas mk-off-canvas-446fcfe9 mk-off-canvas-fade-in inited">
			<div className="swm-off-canvas-wrap">
                <div className="mk-off-canvas-close mk-icon"><a href="#"><svg xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 47.971 47.971" style={{ enableBackground: "new 0 0 47.971 47.971" }} xml:space="preserve" className="swm-svg--close-alt swm-svg-off-canvas-close-icon"><g><path d="M28.228,23.986L47.092,5.122c1.172-1.171,1.172-3.071,0-4.242c-1.172-1.172-3.07-1.172-4.242,0L23.986,19.744L5.121,0.88 c-1.172-1.172-3.07-1.172-4.242,0c-1.172,1.171-1.172,3.071,0,4.242l18.865,18.864L0.879,42.85c-1.172,1.171-1.172,3.071,0,4.242 C1.465,47.677,2.233,47.97,3,47.97s1.535-0.293,2.121-0.879l18.865-18.864L42.85,47.091c0.586,0.586,1.354,0.879,2.121,0.879 s1.535-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242L28.228,23.986z"></path></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg></a></div>
                		<div data-elementor-type="wp-post" data-elementor-id="2378" className="elementor elementor-2378">
				<div data-id="4765e4b5" data-element_type="container" data-settings="&#123;&quot;background_background&quot;:&quot;classic&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-4765e4b5 e-con-full e-flex mk-enable-fade-animation-none e-con e-parent">
		<div data-id="7b1f5f3" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-7b1f5f3 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="5adc94d1" data-element_type="widget" data-settings="&#123;&quot;_position&quot;:&quot;absolute&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="image.default" className="mk_sections_item elementor-element elementor-element-5adc94d1 elementor-absolute mk-enable-fade-animation-none elementor-widget elementor-widget-image">
				<div className="elementor-widget-container">
																<a href="https://solis.premiumthemes.in/">
							<img width="125" height="123" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/logo-symbol-l.png" alt="" className="attachment-full size-full wp-image-2226" />								</a>
															</div>
				</div>
				<div data-id="3904a6a9" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="mk_full_screen_menu.default" className="mk_sections_item elementor-element elementor-element-3904a6a9 fullscreenmenu-indicator-yes mk-enable-fade-animation-none elementor-widget elementor-widget-mk_full_screen_menu">
				<div className="elementor-widget-container">
					<div className="mk-fullscreen-menu mk-fullscreen-menu-indicator-no"><div className="menu-full-screen-menu-container"><ul id="menu-full-screen-menu" className="mk-fullscreen-menu-list"><li id="menu-item-2529" className="menu-item menu-item-type-custom menu-item-object-custom current-menu-ancestor current-menu-parent menu-item-has-children menu-item-2529 swm-m-active"><a href="#" className="menu-indicator-icon"><span><span>Home<svg viewBox="0 0 37 38.1" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow swm-svg-submenu-indicator"><path d="M0 18.5H35.5M35.5 18.5C29.3333 17.1667 17 11.6 17 0M35.5 18.5C29.3333 19.6667 17 25 17 37" strokeWidth="3.5"></path></svg></span></span></a>
<ul className="sub-menu">
	<li id="menu-item-2517" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-home menu-item-2517"><a href="https://solis.premiumthemes.in/"><span><span>Main Home</span></span></a></li>
	<li id="menu-item-3462" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-3462"><a href="https://solis.premiumthemes.in/creative-agency/"><span><span>Creative Agency</span></span></a></li>
	<li id="menu-item-2518" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2518"><a href="https://solis.premiumthemes.in/design-studio/"><span><span>Design Studio</span></span></a></li>
	<li id="menu-item-2519" className="menu-item menu-item-type-post_type menu-item-object-page current-menu-item page_item page-item-2342 current_page_item menu-item-2519 swm-m-active"><a href="https://solis.premiumthemes.in/digital-agency/" aria-current="page"><span><span>Digital Agency</span></span></a></li>
</ul>
</li>
<li id="menu-item-2526" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-2526"><a href="#" className="menu-indicator-icon"><span><span>Pages<svg viewBox="0 0 37 38.1" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow swm-svg-submenu-indicator"><path d="M0 18.5H35.5M35.5 18.5C29.3333 17.1667 17 11.6 17 0M35.5 18.5C29.3333 19.6667 17 25 17 37" strokeWidth="3.5"></path></svg></span></span></a>
<ul className="sub-menu">
	<li id="menu-item-2514" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2514"><a href="https://solis.premiumthemes.in/about-us/"><span><span>About Us</span></span></a></li>
	<li id="menu-item-4020" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-4020"><a href="https://solis.premiumthemes.in/about-me/"><span><span>About Me</span></span></a></li>
	<li id="menu-item-2520" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2520"><a href="https://solis.premiumthemes.in/our-team/"><span><span>Our Team</span></span></a></li>
	<li id="menu-item-2524" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2524"><a href="https://solis.premiumthemes.in/our-services/"><span><span>Our Services</span></span></a></li>
</ul>
</li>
<li id="menu-item-2527" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-2527"><a href="#" className="menu-indicator-icon"><span><span>Portfolio<svg viewBox="0 0 37 38.1" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow swm-svg-submenu-indicator"><path d="M0 18.5H35.5M35.5 18.5C29.3333 17.1667 17 11.6 17 0M35.5 18.5C29.3333 19.6667 17 25 17 37" strokeWidth="3.5"></path></svg></span></span></a>
<ul className="sub-menu">
	<li id="menu-item-2521" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2521"><a href="https://solis.premiumthemes.in/portfolio-gallery/"><span><span>Portfolio Gallery</span></span></a></li>
	<li id="menu-item-2522" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2522"><a href="https://solis.premiumthemes.in/portfolio-metro/"><span><span>Portfolio Metro</span></span></a></li>
	<li id="menu-item-2523" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2523"><a href="https://solis.premiumthemes.in/portfolio-standard/"><span><span>Portfolio Standard</span></span></a></li>
	<li id="menu-item-3323" className="menu-item menu-item-type-post_type menu-item-object-portfolio menu-item-3323"><a href="https://solis.premiumthemes.in/portfolio-item/radiant-prism/"><span><span>Portfolio Single</span></span></a></li>
</ul>
</li>
<li id="menu-item-2528" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-2528"><a href="#" className="menu-indicator-icon"><span><span>Blog<svg viewBox="0 0 37 38.1" style={{ fill: "none", stroke: "currentColor" }} className="swm-svg--arrow swm-svg-submenu-indicator"><path d="M0 18.5H35.5M35.5 18.5C29.3333 17.1667 17 11.6 17 0M35.5 18.5C29.3333 19.6667 17 25 17 37" strokeWidth="3.5"></path></svg></span></span></a>
<ul className="sub-menu">
	<li id="menu-item-2532" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2532"><a href="https://solis.premiumthemes.in/right-sidebar/"><span><span>Right Sidebar</span></span></a></li>
	<li id="menu-item-2515" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-2515"><a href="https://solis.premiumthemes.in/blog-grid/"><span><span>Blog Grid</span></span></a></li>
	<li id="menu-item-2533" className="menu-item menu-item-type-post_type menu-item-object-post menu-item-2533"><a href="https://solis.premiumthemes.in/the-future-of-remote-work/"><span><span>Blog Single</span></span></a></li>
</ul>
</li>
<li id="menu-item-3529" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-3529"><a href="https://solis.premiumthemes.in/contact/"><span><span>Contact</span></span></a></li>
</ul></div></div>				</div>
				</div>
				</div>
		<div data-id="d94573f" data-element_type="container" data-settings="&#123;&quot;background_background&quot;:&quot;classic&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-d94573f e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
		<div data-id="129b69af" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-129b69af e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="2b2eb2f4" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="image.default" className="mk_sections_item elementor-element elementor-element-2b2eb2f4 mk-enable-fade-animation-none elementor-widget elementor-widget-image">
				<div className="elementor-widget-container">
															<img width="750" height="485" src="https://solis.premiumthemes.in/wp-content/uploads/2025/06/fullscreen-menu.jpg" alt="" sizes="(max-width: 750px) 100vw, 750px" className="attachment-full size-full wp-image-1971" srcSet="https://solis.premiumthemes.in/wp-content/uploads/2025/06/fullscreen-menu.jpg 750w, https://solis.premiumthemes.in/wp-content/uploads/2025/06/fullscreen-menu-300x194.jpg 300w" />															</div>
				</div>
				</div>
		<div data-id="654b6da8" data-element_type="container" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;&#125;" className="elementor-element elementor-element-654b6da8 e-con-full e-flex mk-enable-fade-animation-none e-con e-child">
				<div data-id="7ecc2b1d" data-element_type="widget" data-settings="&#123;&quot;_transform_rotateZ_effect&quot;:&#123;&quot;unit&quot;:&quot;px&quot;,&quot;size&quot;:-13,&quot;sizes&quot;:[]&#125;,&quot;_position&quot;:&quot;absolute&quot;,&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;,&quot;_transform_rotateZ_effect_laptop&quot;:&#123;&quot;unit&quot;:&quot;deg&quot;,&quot;size&quot;:&quot;&quot;,&quot;sizes&quot;:[]&#125;,&quot;_transform_rotateZ_effect_tablet&quot;:&#123;&quot;unit&quot;:&quot;deg&quot;,&quot;size&quot;:&quot;&quot;,&quot;sizes&quot;:[]&#125;,&quot;_transform_rotateZ_effect_mobile&quot;:&#123;&quot;unit&quot;:&quot;deg&quot;,&quot;size&quot;:&quot;&quot;,&quot;sizes&quot;:[]&#125;&#125;" data-widget_type="button.default" className="mk_sections_item elementor-element elementor-element-7ecc2b1d e-transform elementor-absolute mk-enable-fade-animation-none elementor-widget elementor-widget-button">
				<div className="elementor-widget-container">
									<div className="elementor-button-wrapper">
					<a href="#" className="elementor-button elementor-button-link elementor-size-sm">
						<span className="elementor-button-content-wrapper">
									<span className="elementor-button-text">Contact</span>
					</span>
					</a>
				</div>
								</div>
				</div>
				<div data-id="63ddd8a1" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="icon-list.default" className="mk_sections_item elementor-element elementor-element-63ddd8a1 elementor-icon-list--layout-traditional elementor-list-item-link-full_width mk-enable-fade-animation-none elementor-widget elementor-widget-icon-list">
				<div className="elementor-widget-container">
							<ul className="elementor-icon-list-items">
							<li className="elementor-icon-list-item">
											<a href="mailto:info@sitename.com">

											<span className="elementor-icon-list-text">info@sitename.com</span>
											</a>
									</li>
								<li className="elementor-icon-list-item">
											<a href="tel:+18884567890">

											<span className="elementor-icon-list-text">+1 987 654 3210</span>
											</a>
									</li>
						</ul>
						</div>
				</div>
				<div data-id="4993cd71" data-element_type="widget" data-settings="&#123;&quot;mk-animation-effect&quot;:&quot;none&quot;,&quot;mk_ext_is_infinite&quot;:&quot;false&quot;,&quot;mk_ext_is_scrollme&quot;:&quot;false&quot;&#125;" data-widget_type="social-icons.default" className="mk_sections_item elementor-element elementor-element-4993cd71 elementor-shape-square elementor-grid-0 mk-enable-fade-animation-none elementor-widget elementor-widget-social-icons">
				<div className="elementor-widget-container">
							<div role="list" className="elementor-social-icons-wrapper elementor-grid">
							<span role="listitem" className="elementor-grid-item">
					<a href="https://dribbble.com/" target="_blank" className="elementor-icon elementor-social-icon elementor-social-icon-dribbble elementor-animation-grow elementor-repeater-item-fd23578">
						<span className="elementor-screen-only">Dribbble</span>
						<svg viewBox="0 0 512 512" className="e-font-icon-svg e-fab-dribbble"><path d="M256 8C119.252 8 8 119.252 8 256s111.252 248 248 248 248-111.252 248-248S392.748 8 256 8zm163.97 114.366c29.503 36.046 47.369 81.957 47.835 131.955-6.984-1.477-77.018-15.682-147.502-6.818-5.752-14.041-11.181-26.393-18.617-41.614 78.321-31.977 113.818-77.482 118.284-83.523zM396.421 97.87c-3.81 5.427-35.697 48.286-111.021 76.519-34.712-63.776-73.185-116.168-79.04-124.008 67.176-16.193 137.966 1.27 190.061 47.489zm-230.48-33.25c5.585 7.659 43.438 60.116 78.537 122.509-99.087 26.313-186.36 25.934-195.834 25.809C62.38 147.205 106.678 92.573 165.941 64.62zM44.17 256.323c0-2.166.043-4.322.108-6.473 9.268.19 111.92 1.513 217.706-30.146 6.064 11.868 11.857 23.915 17.174 35.949-76.599 21.575-146.194 83.527-180.531 142.306C64.794 360.405 44.17 310.73 44.17 256.323zm81.807 167.113c22.127-45.233 82.178-103.622 167.579-132.756 29.74 77.283 42.039 142.053 45.189 160.638-68.112 29.013-150.015 21.053-212.768-27.882zm248.38 8.489c-2.171-12.886-13.446-74.897-41.152-151.033 66.38-10.626 124.7 6.768 131.947 9.055-9.442 58.941-43.273 109.844-90.795 141.978z"></path></svg>					</a>
				</span>
							<span role="listitem" className="elementor-grid-item">
					<a href="https://www.behance.net/" target="_blank" className="elementor-icon elementor-social-icon elementor-social-icon-behance elementor-animation-grow elementor-repeater-item-4b90cc9">
						<span className="elementor-screen-only">Behance</span>
						<svg viewBox="0 0 576 512" className="e-font-icon-svg e-fab-behance"><path d="M232 237.2c31.8-15.2 48.4-38.2 48.4-74 0-70.6-52.6-87.8-113.3-87.8H0v354.4h171.8c64.4 0 124.9-30.9 124.9-102.9 0-44.5-21.1-77.4-64.7-89.7zM77.9 135.9H151c28.1 0 53.4 7.9 53.4 40.5 0 30.1-19.7 42.2-47.5 42.2h-79v-82.7zm83.3 233.7H77.9V272h84.9c34.3 0 56 14.3 56 50.6 0 35.8-25.9 47-57.6 47zm358.5-240.7H376V94h143.7v34.9zM576 305.2c0-75.9-44.4-139.2-124.9-139.2-78.2 0-131.3 58.8-131.3 135.8 0 79.9 50.3 134.7 131.3 134.7 61.3 0 101-27.6 120.1-86.3H509c-6.7 21.9-34.3 33.5-55.7 33.5-41.3 0-63-24.2-63-65.3h185.1c.3-4.2.6-8.7.6-13.2zM390.4 274c2.3-33.7 24.7-54.8 58.5-54.8 35.4 0 53.2 20.8 56.2 54.8H390.4z"></path></svg>					</a>
				</span>
							<span role="listitem" className="elementor-grid-item">
					<a href="https://www.instagram.com/" target="_blank" className="elementor-icon elementor-social-icon elementor-social-icon-instagram elementor-animation-grow elementor-repeater-item-c2c8cfe">
						<span className="elementor-screen-only">Instagram</span>
						<svg viewBox="0 0 448 512" className="e-font-icon-svg e-fab-instagram"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg>					</a>
				</span>
					</div>
						</div>
				</div>
				</div>
				</div>
				</div>
				</div>
					</div>
		</div>

		











































</div><span id="elementor-device-mode" className="elementor-screen-only"></span>  

<div className="mk-custom-cursor mk-cursor-holder"><div className="mk-custom-cursor-inner"><svg enable-background="new 0 0 256 512" viewBox="0 0 256 512"><path d="m52.1 245.3 144-160c5.9-6.6 16-7.1 22.6-1.2 6.9 6.3 6.8 16.4 1.2 22.6l-134.4 149.3 134.4 149.3c5.9 6.6 5.4 16.7-1.2 22.6s-16.7 5.4-22.6-1.2l-144-160c-5.5-6.1-5.5-15.3 0-21.4z"></path></svg><svg viewBox="0 0 256 512"><path d="m219.898 266.719-144.01 159.99c-5.906 6.562-16.031 7.094-22.593 1.187-6.918-6.271-6.784-16.394-1.188-22.625l134.367-149.271-134.367-149.271c-5.877-6.594-5.361-16.688 1.188-22.625 6.562-5.907 16.687-5.375 22.593 1.187l144.01 159.99c5.469 6.125 5.469 15.313 0 21.438z"></path></svg></div></div>
      <Footer {...props} />
    </div>
  );
}
