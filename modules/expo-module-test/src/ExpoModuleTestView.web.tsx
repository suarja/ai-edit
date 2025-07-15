import * as React from 'react';

import { ExpoModuleTestViewProps } from './ExpoModuleTest.types';

export default function ExpoModuleTestView(props: ExpoModuleTestViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
