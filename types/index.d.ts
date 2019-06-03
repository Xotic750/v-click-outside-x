import Vue, { VNodeDirective } from 'vue';

declare function install(Vue: Vue): any;
declare var directive: VNodeDirective;

export {
  install,
  directive
};
