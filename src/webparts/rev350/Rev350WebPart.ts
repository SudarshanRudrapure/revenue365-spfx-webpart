//PnPJS setup

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { sp } from '@pnp/sp';
import Revenue365 from './components/Rev350';

export default class Revenue365WebPart extends BaseClientSideWebPart<{}> {

  // onInit runs BEFORE anything else
  // Perfect place to setup PnPJS
  public async onInit(): Promise<void> {
    await super.onInit();

    // Setup PnPJS with SharePoint context
    // This tells PnPJS:
    // → Which site to connect to
    // → How to authenticate
    // → All done automatically!
    sp.setup({
      spfxContext: this.context
    });
  }

  // render mounts our React app
  public render(): void {
    const element = React.createElement(Revenue365);
    ReactDom.render(element, this.domElement);
  }

  // cleanup when web part removed
  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}