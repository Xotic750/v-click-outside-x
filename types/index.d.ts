import { PluginFunction, DirectiveOptions } from 'vue';

declare var install: PluginFunction<any>;
declare var directive: DirectiveOptions;

export {
  install,
  directive
};
