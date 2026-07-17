#!/usr/bin/env node
/**
 * One-off builder: seed confs.tech niche topics + supplements → src/content/conferences/
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  applyBrandInstances,
  formatConference,
  sortInstances,
  validateInstances,
} from "./lib/brand-instances.mjs"
import { conferencesDir, writeBrandDir } from "./lib/conference-io.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const seedDir = path.join(__dirname, ".conf-seed")

const TOPIC_SUBJECTS = {
  javascript: ["javascript", "frontend", "web"],
  css: ["css", "frontend", "web"],
  typescript: ["typescript", "javascript", "frontend"],
  ux: ["ux", "ui-design", "product-design"],
  accessibility: ["accessibility", "frontend", "web"],
  performance: ["performance", "web", "frontend"],
  product: ["product-design", "ux"],
  general: ["web"],
}

/** Keyword → subjects for name-based enrichment */
const NAME_HINTS = [
  [/react/i, ["react", "javascript", "frontend"]],
  [/vue/i, ["vue", "javascript", "frontend"]],
  [/angular/i, ["javascript", "frontend", "web"]],
  [/svelte/i, ["javascript", "frontend", "web"]],
  [/node/i, ["javascript", "web"]],
  [/css/i, ["css", "frontend", "web"]],
  [/typescript|\bts\b/i, ["typescript", "javascript"]],
  [/\bux\b|user experience|design system/i, ["ux", "ui-design", "design-systems"]],
  [/a11y|accessib/i, ["accessibility"]],
  [/perf|performance/i, ["performance", "web"]],
  [/visuali[sz]|dataviz|data viz|information\+/i, ["data-visualization", "information-design"]],
  [/creative.?code|generative|processing|openframeworks|p5/i, ["creative-coding", "generative-art"]],
  [/figma|sketch|design/i, ["ui-design", "ux"]],
]

const EXCLUDE_NAME =
  /\b(devops|kubernetes|k8s|security|cyber|blockchain|crypto|bitcoin|fintech|java\b(?!script)|kotlin|golang|rust conf|scala|php|python|ruby|android|ios conf|swift|dotnet|\.net|laravel|django|rails|hadoop|spark|kafka|snowflake|databricks|mlops|llm ops)\b/i

const INCLUDE_GENERAL =
  /\b(web|front.?end|javascript|js\b|css|html|ux|ui\b|design|react|vue|typescript|accessib|a11y|perf|visuali|creative|figma|smashing|css day|beyond tellerrand|fronteers|event apart)\b/i

/** Brand-level supplements (gaps + user examples + niche) */
const SUPPLEMENTS = [
  { name: "Nordic.js", url: "https://nordicjs.com", subjects: ["javascript", "frontend", "web"] },
  { name: "JSHeroes", url: "https://jsheroes.io", subjects: ["javascript", "frontend", "web"] },
  { name: "JSNation", url: "https://jsnation.com", subjects: ["javascript", "frontend", "web"] },
  { name: "SmashingConf", url: "https://smashingconf.com", subjects: ["frontend", "css", "ux", "web", "design-systems", "performance"] },
  { name: "FITC", url: "https://fitc.ca", subjects: ["web", "frontend", "creative-coding", "ux", "javascript"] },
  { name: "International JavaScript Conference", url: "https://javascript-conference.com", subjects: ["javascript", "frontend", "web", "typescript"] },
  { name: "CSS Day", url: "https://cssday.nl", subjects: ["css", "frontend", "web"] },
  { name: "Beyond Tellerrand", url: "https://beyondtellerrand.com", subjects: ["web", "frontend", "ux", "design-systems", "creative-coding"] },
  { name: "An Event Apart", url: "https://aneventapart.com", subjects: ["web", "frontend", "ux", "accessibility", "design-systems"] },
  { name: "Fronteers Conference", url: "https://fronteers.nl/congres", subjects: ["frontend", "web", "javascript", "css"] },
  { name: "Clarity Conference", url: "https://www.clarityconf.com", subjects: ["design-systems", "ux", "ui-design"] },
  { name: "UXLx", url: "https://ux-lx.com", subjects: ["ux", "ui-design", "product-design"] },
  { name: "PUSH UX", url: "https://push-conference.com", subjects: ["ux", "ui-design", "product-design"] },
  { name: "uxcon vienna", url: "https://www.uxcon.io", subjects: ["ux", "ui-design", "product-design"] },
  { name: "Config", url: "https://config.figma.com", subjects: ["ui-design", "ux", "design-systems", "product-design"] },
  { name: "ConveyUX", url: "https://conveyux.com", subjects: ["ux", "ui-design", "product-design"] },
  { name: "Interaction", url: "https://interaction26.ixda.org", subjects: ["ux", "ui-design", "product-design"] },
  { name: "UX Australia", url: "https://uxaustralia.com.au", subjects: ["ux", "ui-design", "product-design"] },
  { name: "World Information Architecture Day", url: "https://www.worldiaday.org", subjects: ["ux", "information-design", "product-design"] },
  { name: "Design Matters", url: "https://designmatters.io", subjects: ["ux", "ui-design", "product-design", "design-systems"] },
  { name: "Leading Design", url: "https://leadingdesign.com", subjects: ["ux", "product-design", "design-systems"] },
  { name: "Mirror Conf", url: "https://www.mirrorconf.com", subjects: ["ux", "frontend", "web", "design-systems"] },
  { name: "Generate CSS", url: "https://www.generateconf.com", subjects: ["css", "frontend", "web"] },
  { name: "dotCSS", url: "https://www.dotcss.io", subjects: ["css", "frontend", "web"] },
  { name: "dotJS", url: "https://www.dotjs.io", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf", url: "https://jsconf.com", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf EU", url: "https://jsconf.eu", subjects: ["javascript", "frontend", "web"] },
  { name: "React Conf", url: "https://conf.react.dev", subjects: ["react", "javascript", "frontend"] },
  { name: "React Summit", url: "https://reactsummit.com", subjects: ["react", "javascript", "frontend"] },
  { name: "React Day Berlin", url: "https://reactday.berlin", subjects: ["react", "javascript", "frontend"] },
  { name: "React Advanced", url: "https://reactadvanced.com", subjects: ["react", "javascript", "frontend"] },
  { name: "Node Congress", url: "https://nodecongress.com", subjects: ["javascript", "web"] },
  { name: "performance.now()", url: "https://perfnow.nl", subjects: ["performance", "web", "frontend"] },
  { name: "State of the Browser", url: "https://stateofthebrowser.com", subjects: ["web", "frontend", "browsers"] },
  { name: "View Source", url: "https://viewsourceconf.org", subjects: ["web", "frontend", "javascript"] },
  { name: "Web Directions", url: "https://webdirections.org", subjects: ["web", "frontend", "javascript", "css"] },
  { name: "Information+", url: "https://informationplusconference.com", subjects: ["data-visualization", "information-design"] },
  { name: "OpenVisConf", url: "https://openvisconf.com", subjects: ["data-visualization", "web", "javascript"] },
  { name: "Outlier", url: "https://outlierconf.com", subjects: ["data-visualization", "information-design"] },
  { name: "VisFest", url: "https://visfest.com", subjects: ["data-visualization"] },
  { name: "IEEE VIS", url: "https://ieeevis.org", subjects: ["data-visualization", "research", "information-design"] },
  { name: "EuroVis", url: "https://www.eurovis.org", subjects: ["data-visualization", "research"] },
  { name: "Observable", url: "https://observablehq.com", subjects: ["data-visualization", "javascript", "web"] },
  { name: "Tapestry Conference", url: "https://tapestryconference.com", subjects: ["data-visualization", "information-design"] },
  { name: "Eyeo Festival", url: "https://eyeofestival.com", subjects: ["creative-coding", "generative-art", "data-visualization"] },
  { name: "Processing Community Day", url: "https://processingfoundation.org", subjects: ["creative-coding", "generative-art"] },
  { name: "MUTEK", url: "https://mutek.org", subjects: ["creative-coding", "generative-art"] },
  { name: "NODE Forum for Digital Arts", url: "https://nodeforum.org", subjects: ["creative-coding", "generative-art"] },
  { name: "CODAME ART+TECH", url: "https://codame.com", subjects: ["creative-coding", "generative-art"] },
  { name: "HalfStack", url: "https://halfstackconf.com", subjects: ["javascript", "frontend", "web"] },
  { name: "CityJS", url: "https://cityjsconf.org", subjects: ["javascript", "frontend", "web"] },
  { name: "enterJS", url: "https://enterjs.de", subjects: ["javascript", "frontend", "web"] },
  { name: "JSworld Conference", url: "https://jsworldconference.com", subjects: ["javascript", "frontend", "web"] },
  { name: "Vuejs Amsterdam", url: "https://vuejs.amsterdam", subjects: ["vue", "javascript", "frontend"] },
  { name: "CascadiaJS", url: "https://cascadiajs.com", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf Chile", url: "https://jsconf.cl", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf Budapest", url: "https://jsconfbp.com", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf Ireland", url: "https://www.jsconf.ie", subjects: ["javascript", "frontend", "web"] },
  { name: "Armada JS", url: "https://armada-js.com", subjects: ["javascript", "frontend", "web"] },
  { name: "App.js Conf", url: "https://appjs.co", subjects: ["javascript", "react", "frontend"] },
  { name: "Connect.Tech", url: "https://connect.tech", subjects: ["javascript", "frontend", "web"] },
  { name: "Wey Wey Web", url: "https://www.weyweyweb.com", subjects: ["frontend", "web", "javascript", "ux"] },
  { name: "Web Summer Camp", url: "https://websummercamp.com", subjects: ["web", "frontend", "javascript"] },
  { name: "Positive Design Days", url: "https://positive-design-days.com", subjects: ["ux", "ui-design", "design-systems"] },
  { name: "Y Oslo", url: "https://www.y-oslo.com", subjects: ["ux", "ui-design", "product-design"] },
  { name: "Digital Design & UX", url: "https://dd-ux.de", subjects: ["ux", "ui-design", "product-design"] },
  { name: "UXDX", url: "https://uxdx.com", subjects: ["ux", "product-design", "design-systems"] },
  { name: "Hatch Conference", url: "https://www.hatchconference.com", subjects: ["ux", "product-design"] },
  { name: "Awwwards Conference", url: "https://conference.awwwards.com", subjects: ["web", "ui-design", "frontend", "creative-coding"] },
  { name: "Inclusive Design 24", url: "https://inclusivedesign24.org", subjects: ["accessibility", "ux", "web"] },
  { name: "axe-con", url: "https://www.deque.com/axe-con", subjects: ["accessibility", "web", "frontend"] },
  { name: "Typo Berlin", url: "https://typotalks.com/berlin", subjects: ["ui-design", "information-design", "design-systems"] },
  { name: "Typographics", url: "https://typographics.com", subjects: ["ui-design", "information-design"] },
  { name: "Kerning", url: "https://kerning.it", subjects: ["ui-design", "web", "frontend"] },
  { name: "Ampersand", url: "https://ampersandconf.com", subjects: ["ui-design", "web", "css"] },
  { name: "TypeCon", url: "https://www.typecon.com", subjects: ["ui-design", "information-design"] },
  { name: "ATypI", url: "https://atypi.org", subjects: ["ui-design", "information-design"] },
  { name: "Reasons to", url: "https://reasons.to", subjects: ["web", "frontend", "ux", "creative-coding"] },
  { name: "Pixel Pioneers", url: "https://pixelpioneers.co", subjects: ["frontend", "web", "css", "javascript"] },
  { name: "UX London", url: "https://uxlondon.com", subjects: ["ux", "ui-design", "product-design"] },
  { name: "UX Cambridge", url: "https://uxcambridge.net", subjects: ["ux", "ui-design", "product-design"] },
  { name: "Service Design Days", url: "https://www.servicedesigndays.com", subjects: ["ux", "product-design"] },
  { name: "EuroIA", url: "https://euroia.org", subjects: ["ux", "information-design", "product-design"] },
  { name: "World Usability Congress", url: "https://worldusabilitycongress.com", subjects: ["ux", "ui-design", "product-design"] },
  { name: "Advancing Research", url: "https://advancingresearchconference.com", subjects: ["ux", "product-design", "research"] },
  { name: "DesignOps Summit", url: "https://designopssummit.com", subjects: ["design-systems", "ux", "product-design"] },
  { name: "Into Design Systems", url: "https://intodesignsystems.com", subjects: ["design-systems", "ux", "ui-design"] },
  { name: "Adobe MAX", url: "https://www.adobe.com/max", subjects: ["ui-design", "creative-coding", "product-design"] },
  { name: "CSS Conf Australia", url: "https://cssconf.com.au", subjects: ["css", "frontend", "web"] },
  { name: "CSSConf Budapest", url: "https://cssconfbp.hu", subjects: ["css", "frontend", "web"] },
  { name: "JSConf Australia", url: "https://jsconfau.com", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf Asia", url: "https://jsconf.asia", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf Japan", url: "https://jsconf.jp", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf Korea", url: "https://jsconf.kr", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf Hawaiʻi", url: "https://www.jsconfhi.com", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf México", url: "https://jsconfmx.org", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf España", url: "https://jsconf.es", subjects: ["javascript", "frontend", "web"] },
  { name: "JSConf Armenia", url: "https://jsconf.am", subjects: ["javascript", "frontend", "web"] },
  { name: "React Finland", url: "https://react-finland.fi", subjects: ["react", "javascript", "frontend"] },
  { name: "React Norway", url: "https://reactnorway.com", subjects: ["react", "javascript", "frontend"] },
  { name: "React Alicante", url: "https://reactalicante.es", subjects: ["react", "javascript", "frontend"] },
  { name: "React Brussels", url: "https://www.react.brussels", subjects: ["react", "javascript", "frontend"] },
  { name: "React Paris", url: "https://react.paris", subjects: ["react", "javascript", "frontend"] },
  { name: "React Miami", url: "https://www.reactmiami.com", subjects: ["react", "javascript", "frontend"] },
  { name: "React Rally", url: "https://reactrally.com", subjects: ["react", "javascript", "frontend"] },
  { name: "React Native EU", url: "https://www.react-native.eu", subjects: ["react", "javascript", "frontend"] },
  { name: "Chain React", url: "https://chainreactconf.com", subjects: ["react", "javascript", "frontend"] },
  { name: "React Nexus", url: "https://reactnexus.com", subjects: ["react", "javascript", "frontend"] },
  { name: "React Africa", url: "https://react-africa.com", subjects: ["react", "javascript", "frontend"] },
  { name: "Svelte Summit", url: "https://sveltesummit.com", subjects: ["javascript", "frontend", "web"] },
  { name: "ViteConf", url: "https://viteconf.org", subjects: ["javascript", "frontend", "web"] },
  { name: "Next.js Conf", url: "https://nextjs.org/conf", subjects: ["react", "javascript", "frontend", "web"] },
  { name: "Nuxt Nation", url: "https://nuxtnation.com", subjects: ["vue", "javascript", "frontend"] },
  { name: "Vue.js Live", url: "https://vuejslive.com", subjects: ["vue", "javascript", "frontend"] },
  { name: "Vuejs.de Conf", url: "https://conf.vuejs.de", subjects: ["vue", "javascript", "frontend"] },
  { name: "MadVue", url: "https://madvue.es", subjects: ["vue", "javascript", "frontend"] },
  { name: "Angular Belgrade", url: "https://angularbelgrade.org", subjects: ["javascript", "frontend", "web"] },
  { name: "ng-conf", url: "https://ng-conf.org", subjects: ["javascript", "frontend", "web"] },
  { name: "NG-DE", url: "https://ng-de.org", subjects: ["javascript", "frontend", "web"] },
  { name: "TypeScript Congress", url: "https://typescriptcongress.com", subjects: ["typescript", "javascript", "frontend"] },
  { name: "Eleventy International Symposium", url: "https://conf.11ty.dev", subjects: ["web", "frontend", "javascript"] },
  { name: "Webflow Conf", url: "https://webflow.com/webflow-conf", subjects: ["web", "ui-design", "frontend"] },
  { name: "KIKK Festival", url: "https://www.kikk.be", subjects: ["creative-coding", "generative-art", "web"] },
  { name: "OFFF Barcelona", url: "https://offf.barcelona", subjects: ["ui-design", "creative-coding", "generative-art"] },
  { name: "OFFSET Dublin", url: "https://www.iloveoffset.com", subjects: ["ui-design", "creative-coding"] },
  { name: "Semi Permanent", url: "https://semipermanent.com", subjects: ["ui-design", "creative-coding"] },
  { name: "Design Indaba", url: "https://www.designindaba.com", subjects: ["ui-design", "ux", "creative-coding"] },
  { name: "What Design Can Do", url: "https://www.whatdesigncando.com", subjects: ["ui-design", "ux", "product-design"] },
  { name: "Ars Electronica Festival", url: "https://ars.electronica.art", subjects: ["creative-coding", "generative-art"] },
  { name: "Transmediale", url: "https://transmediale.de", subjects: ["creative-coding", "generative-art"] },
  { name: "CTM Festival", url: "https://www.ctm-festival.de", subjects: ["creative-coding", "generative-art"] },
  { name: "Sonic Acts", url: "https://sonicacts.com", subjects: ["creative-coding", "generative-art"] },
  { name: "Gray Area Festival", url: "https://grayarea.org", subjects: ["creative-coding", "generative-art"] },
  { name: "Resonate Festival", url: "https://resonate.io", subjects: ["creative-coding", "generative-art"] },
  { name: "ICLC", url: "https://iclc.toplap.org", subjects: ["creative-coding", "generative-art"] },
  { name: "NIME", url: "https://www.nime.org", subjects: ["creative-coding", "research"] },
  { name: "ISEA", url: "https://isea-international.org", subjects: ["creative-coding", "generative-art", "research"] },
  { name: "xCoAx", url: "https://xcoax.org", subjects: ["creative-coding", "generative-art", "research"] },
  { name: "Generative Art Conference", url: "https://www.generativeart.com", subjects: ["generative-art", "creative-coding", "research"] },
  { name: "Visualized Conference", url: "https://visualized.com", subjects: ["data-visualization", "information-design"] },
  { name: "Malofiej", url: "https://www.malofiejgraphics.com", subjects: ["data-visualization", "information-design"] },
  { name: "SND", url: "https://www.snd.org", subjects: ["information-design", "ui-design", "data-visualization"] },
  { name: "Data Visualization Society", url: "https://www.datavisualizationsociety.org", subjects: ["data-visualization", "information-design"] },
  { name: "Nightingale / DVS", url: "https://nightingaledvs.com", subjects: ["data-visualization", "information-design"] },
  { name: "PacificVis", url: "https://ieee-pacificvis.github.io", subjects: ["data-visualization", "research"] },
  { name: "WeAreDevelopers World Congress", url: "https://www.wearedevelopers.com/world-congress", subjects: ["javascript", "web", "frontend"] },
  { name: "Devworld Conference", url: "https://devworldconference.com", subjects: ["web", "javascript", "frontend"] },
  { name: "Frontend United", url: "https://frontendunited.com", subjects: ["frontend", "web", "javascript"] },
  { name: "Frontend Conference Zurich", url: "https://frontendconf.ch", subjects: ["frontend", "web", "javascript"] },
  { name: "Frontend Con", url: "https://frontend-con.io", subjects: ["frontend", "web", "javascript"] },
  { name: "HolyJS", url: "https://holyjs.ru", subjects: ["javascript", "frontend", "web"] },
  { name: "fwdays", url: "https://fwdays.com", subjects: ["javascript", "frontend", "web"] },
  { name: "Chrome Dev Summit", url: "https://developer.chrome.com", subjects: ["web", "frontend", "performance", "javascript"] },
  { name: "UXinsight", url: "https://uxinsight.org", subjects: ["ux", "product-design", "research"] },
  { name: "NNgroup UX Conference", url: "https://www.nngroup.com/ux-conference", subjects: ["ux", "ui-design", "product-design"] },
  { name: "StrapiConf", url: "https://www.strapi.io/strapiconf", subjects: ["javascript", "web", "cms"] },
  { name: "Vercel Ship", url: "https://vercel.com/ship", subjects: ["web", "frontend", "javascript", "react"] },
  { name: "Netlify Compose", url: "https://www.netlify.com/conference", subjects: ["web", "frontend", "javascript"] },
  { name: "JetBrains JavaScript Day", url: "https://lp.jetbrains.com/javascript-day", subjects: ["javascript", "typescript", "frontend"] },
  { name: "WebExpo", url: "https://www.webexpo.net", subjects: ["web", "frontend", "javascript", "ux"] },
  { name: "MozFest", url: "https://www.mozillafestival.org", subjects: ["web", "accessibility", "frontend"] },
  { name: "IndieWebCamp", url: "https://indieweb.org", subjects: ["web", "frontend"] },
  { name: "Deconstruct Conf", url: "https://www.deconstructconf.com", subjects: ["web", "javascript", "frontend"] },
  { name: "Micro Frontends Conference", url: "https://conference.microfrontends.cloud", subjects: ["frontend", "javascript", "web"] },
  { name: "Mind the Product", url: "https://www.mindtheproduct.com", subjects: ["product-design", "ux"] },
  { name: "ProductCon", url: "https://www.productschool.com/productcon", subjects: ["product-design", "ux"] },
  { name: "Industry Conf", url: "https://industryconference.com", subjects: ["product-design", "ux"] },
  { name: "Penpot Fest", url: "https://penpot.app", subjects: ["ui-design", "design-systems", "open-source"] },
  { name: "FOSDEM", url: "https://fosdem.org", subjects: ["web", "javascript", "frontend", "open-source"] },
  { name: "JavaScript Days", url: "https://javascript-days.de", subjects: ["javascript", "frontend", "web", "typescript"] },
  { name: "Webinale", url: "https://webinale.de", subjects: ["web", "frontend", "javascript"] },
  { name: "MAD Summit", url: "https://mad-summit.de", subjects: ["web", "frontend", "javascript", "design-systems"] },
  { name: "J on the Beach", url: "https://jonthebeach.com", subjects: ["web", "javascript", "data-visualization"] },
  { name: "Open Source Day", url: "https://osday.dev", subjects: ["javascript", "web", "frontend"] },
  { name: "JSCraftCamp", url: "https://jscraftcamp.org", subjects: ["javascript", "frontend", "web"] },
  { name: "The Dutch JavaScript Conference", url: "https://www.djsconf.com", subjects: ["javascript", "frontend", "web"] },
  { name: "Future Frontend", url: "https://futurefrontend.com", subjects: ["frontend", "web", "javascript"] },
  { name: "Frontend Barcelona", url: "https://frontend.barcelona", subjects: ["frontend", "web", "javascript"] },
  { name: "Middlesbrough Front End", url: "https://middlesbroughfe.co.uk", subjects: ["frontend", "web", "css"] },
  { name: "SquiggleConf", url: "https://squiggleconf.com", subjects: ["web", "javascript", "tooling"] },
  { name: "UtahJS Conf", url: "https://utahjs.com/conference", subjects: ["javascript", "frontend", "web"] },
  { name: "Big Sky Dev Con", url: "https://bigskydevcon.com", subjects: ["javascript", "web", "frontend"] },
  { name: "ConFoo", url: "https://confoo.ca", subjects: ["web", "javascript", "frontend"] },
  { name: "Frontrunners", url: "https://frontrunners.tech", subjects: ["frontend", "web", "javascript"] },
  { name: "Frontend Design Conference", url: "https://frontenddesignconference.com", subjects: ["frontend", "web", "css", "ui-design"] },
  { name: "XtremeJS", url: "https://xtremejs.dev", subjects: ["javascript", "frontend", "web"] },
  { name: "Conf42 JavaScript", url: "https://www.conf42.com/js", subjects: ["javascript", "frontend", "web"] },
  { name: "What The Stack", url: "https://wts.sh", subjects: ["web", "javascript", "frontend"] },
  { name: "JSDC", url: "https://jsdc.tw", subjects: ["javascript", "frontend", "web"] },
  { name: "Frontend Nation", url: "https://frontendnation.com", subjects: ["frontend", "javascript", "web"] },
  { name: "Vue.js Nation", url: "https://vuejsnation.com", subjects: ["vue", "javascript", "frontend"] },
  { name: "JSNation US", url: "https://jsnation.us", subjects: ["javascript", "frontend", "web"] },
  { name: "React Summit US", url: "https://reactsummit.us", subjects: ["react", "javascript", "frontend"] },
  { name: "AI Coding Summit", url: "https://aicodingsummit.com", subjects: ["javascript", "web", "frontend"] },
  { name: "State of JS", url: "https://stateofjs.com", subjects: ["javascript", "css", "frontend", "web"] },
  { name: "GitHub Universe", url: "https://githubuniverse.com", subjects: ["web", "javascript", "frontend"] },
  { name: "CHI", url: "https://chi.acm.org", subjects: ["ux", "research", "ui-design"] },
  { name: "SIGGRAPH", url: "https://www.siggraph.org", subjects: ["creative-coding", "generative-art", "3d", "research"] },
  { name: "Tableau Conference", url: "https://www.tableau.com/events/conference", subjects: ["data-visualization"] },
  { name: "Diagrams Conference", url: "https://www.diagrams-conference.org", subjects: ["information-design", "data-visualization", "research"] },
  { name: "IIID", url: "https://www.iiid.net", subjects: ["information-design", "data-visualization"] },
  { name: "NACIS", url: "https://nacis.org", subjects: ["data-visualization", "information-design"] },
  { name: "VIZBI", url: "https://vizbi.org", subjects: ["data-visualization", "research"] },
  { name: "Electromagnetic Field", url: "https://www.emfcamp.org", subjects: ["creative-coding", "web"] },
  { name: "Hackaday Supercon", url: "https://hackaday.com/supercon", subjects: ["creative-coding", "hardware", "web"] },
  { name: "Revision Demoparty", url: "https://www.revision-party.net", subjects: ["creative-coding", "generative-art"] },
  { name: "Evoke Demoparty", url: "https://www.evoke.eu", subjects: ["creative-coding", "generative-art"] },
  { name: "Mapping Festival", url: "https://www.mappingfestival.com", subjects: ["creative-coding", "generative-art"] },
  { name: "Live Performers Meeting", url: "https://liveperformersmeeting.net", subjects: ["creative-coding", "generative-art"] },
  { name: "EVA London", url: "https://www.eva-london.org", subjects: ["creative-coding", "generative-art", "research"] },
  { name: "Creative Applications Network Events", url: "https://www.creativeapplications.net", subjects: ["creative-coding", "generative-art"] },
  { name: "Dutch Design Week", url: "https://www.ddw.nl", subjects: ["ui-design", "product-design"] },
  { name: "London Design Festival", url: "https://www.londondesignfestival.com", subjects: ["ui-design", "product-design"] },
  { name: "Codemotion", url: "https://www.codemotion.com", subjects: ["web", "javascript", "frontend"] },
  { name: "Devoxx", url: "https://devoxx.com", subjects: ["web", "javascript", "frontend"] },
  { name: "NDC Conferences", url: "https://ndcconferences.com", subjects: ["web", "javascript", "frontend"] },
  { name: "QCon", url: "https://qconferences.com", subjects: ["web", "javascript", "frontend"] },
  { name: "LeadDev", url: "https://leaddev.com", subjects: ["web", "frontend", "product-design"] },
  { name: "API Days", url: "https://www.apidays.global", subjects: ["web", "api", "ux"] },
  { name: "Platform Con", url: "https://platformcon.com", subjects: ["web", "frontend", "javascript"] },
  { name: "Chaos Communication Congress", url: "https://events.ccc.de", subjects: ["web", "creative-coding"] },
  { name: "Open Source Design", url: "https://opensourcedesign.net", subjects: ["ui-design", "ux", "open-source"] },
  { name: "ResearchOps Community Events", url: "https://researchops.community", subjects: ["ux", "research"] },
  { name: "User Research London", url: "https://userresearchlondon.com", subjects: ["ux", "research", "product-design"] },
  { name: "Schema", url: "https://www.schema.conf", subjects: ["design-systems", "ux"] },
  { name: "Design Systems London", url: "https://www.designsystemslondon.com", subjects: ["design-systems", "ux", "ui-design"] },
  { name: "!!Con", url: "https://bangbangcon.com", subjects: ["web", "javascript", "creative-coding"] },
]

function brandKey(name, url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase()
    const path = new URL(url).pathname.replace(/\/+$/, "") || "/"
    const n = name
      .toLowerCase()
      .replace(/\s*20\d{2}\s*/g, " ")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 64)
    return `${host}${path}::${n}`
  } catch {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "")
  }
}

function cleanName(name) {
  return name
    .replace(/\s*20\d{2}\b/g, "")
    .replace(/\s+[–—-]\s+.*$/, (m) => (m.length > 40 ? "" : m))
    .replace(/\s+/g, " ")
    .trim()
}

function mergeSubjects(...lists) {
  const out = []
  const seen = new Set()
  for (const list of lists) {
    for (const s of list || []) {
      const t = String(s).toLowerCase().trim()
      if (!t || seen.has(t)) continue
      seen.add(t)
      out.push(t)
      if (out.length >= 10) return out
    }
  }
  return out
}

function subjectsFromName(name) {
  const found = []
  for (const [re, tags] of NAME_HINTS) {
    if (re.test(name)) found.push(...tags)
  }
  return found
}

function shouldInclude(topic, name) {
  if (EXCLUDE_NAME.test(name) && !INCLUDE_GENERAL.test(name)) return false
  if (topic === "general" || topic === "product") {
    return INCLUDE_GENERAL.test(name)
  }
  return true
}

function loadSeed() {
  const byKey = new Map()
  const years = ["2024", "2025", "2026"]
  const topics = Object.keys(TOPIC_SUBJECTS)

  for (const year of years) {
    for (const topic of topics) {
      const file = path.join(seedDir, `${year}-${topic}.json`)
      if (!fs.existsSync(file)) continue
      const rows = JSON.parse(fs.readFileSync(file, "utf8"))
      for (const row of rows) {
        if (!row?.name || !row?.url) continue
        if (!shouldInclude(topic, row.name)) continue
        const name = cleanName(row.name)
        const url = row.url.startsWith("http") ? row.url : `https://${row.url}`
        const key = brandKey(name, url)
        const base = TOPIC_SUBJECTS[topic] || ["web"]
        const subjects = mergeSubjects(base, subjectsFromName(name))
        const existing = byKey.get(key)
        if (existing) {
          existing.subjects = mergeSubjects(existing.subjects, subjects)
        } else {
          byKey.set(key, { name, url, subjects })
        }
      }
    }
  }
  return byKey
}

function applySupplements(byKey) {
  for (const s of SUPPLEMENTS) {
    const key = brandKey(s.name, s.url)
    const existing = byKey.get(key)
    if (existing) {
      existing.subjects = mergeSubjects(s.subjects, existing.subjects)
      // prefer canonical supplement URL/name for known brands
      existing.name = s.name
      existing.url = s.url
    } else {
      byKey.set(key, {
        name: s.name,
        url: s.url,
        subjects: mergeSubjects(s.subjects, subjectsFromName(s.name)),
      })
    }
  }
}

function enrichKnown(byKey) {
  const known = {
    "cssday.nl": ["css", "frontend", "web"],
    "nordicjs.com": ["javascript", "frontend", "web"],
    "jsheroes.io": ["javascript", "frontend", "web"],
    "jsnation.com": ["javascript", "frontend", "web"],
    "smashingconf.com": ["frontend", "css", "ux", "web", "design-systems"],
    "fitc.ca": ["web", "frontend", "creative-coding", "ux"],
    "javascript-conference.com": ["javascript", "frontend", "web", "typescript"],
    "beyondtellerrand.com": ["web", "frontend", "ux", "creative-coding"],
    "aneventapart.com": ["web", "frontend", "ux", "accessibility"],
    "informationplusconference.com": ["data-visualization", "information-design"],
    "openvisconf.com": ["data-visualization", "javascript", "web"],
    "ieeevis.org": ["data-visualization", "research"],
    "eyeofestival.com": ["creative-coding", "generative-art"],
    "mutek.org": ["creative-coding", "generative-art"],
    "config.figma.com": ["ui-design", "ux", "design-systems"],
    "ux-lx.com": ["ux", "ui-design", "product-design"],
    "push-conference.com": ["ux", "ui-design", "product-design"],
    "perfnow.nl": ["performance", "web", "frontend"],
  }
  for (const conf of byKey.values()) {
    try {
      const host = new URL(conf.url).hostname.replace(/^www\./, "")
      if (known[host]) conf.subjects = mergeSubjects(known[host], conf.subjects)
    } catch {
      /* ignore */
    }
    conf.subjects = mergeSubjects(conf.subjects, subjectsFromName(conf.name))
  }
}

function main() {
  const byKey = loadSeed()
  console.log(`Seed brands: ${byKey.size}`)
  applySupplements(byKey)
  enrichKnown(byKey)

  console.log(`After supplements: ${byKey.size}`)

  const seedList = [...byKey.values()]
    .filter((c) => c.name && c.url?.startsWith("http") && c.subjects?.length >= 1)
    .map((c) => ({
      name: c.name,
      url: c.url,
      subjects: c.subjects.slice(0, 10),
    }))

  const final = sortInstances(applyBrandInstances(seedList).map(formatConference))

  writeBrandDir(final, conferencesDir)
  console.log(`Wrote ${final.length} conference instances → ${conferencesDir}`)

  const errors = validateInstances(final)
  if (errors.length) {
    console.error("Validation failures:", errors.length)
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }
  if (final.length < 300) {
    console.error(`Expected 300+, got ${final.length}`)
    process.exit(1)
  }
}

main()
