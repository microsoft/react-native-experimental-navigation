/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule NavigationTypeDefinition
 * @flow
 */
'use strict';

import { Animated } from 'react-native';

import type React from 'react';

// Object Instances

export type NavigationAnimatedValue = Animated.Value;

// Value  & Structs.

export type NavigationGestureDirection = 'horizontal' | 'vertical' | 'fade' | 'custom';

export type NavigationRoute = {
  key: string,
  title?: string
};

export type NavigationState = {
  index: number,
  routes: Array<NavigationRoute>,
};

export type NavigationLayout = {
  height: NavigationAnimatedValue,
  initHeight: number,
  initWidth: number,
  isMeasured: boolean,
  width: NavigationAnimatedValue,
};

export type NavigationScene = {
  index: number,
  isActive: boolean,
  isStale: boolean,
  key: string,
  route: NavigationRoute,
};

export type NavigationTransitionProps = {
  // The layout of the transitioner of the scenes.
  layout: NavigationLayout,

  // The navigation state of the transitioner.
  navigationState: NavigationState,

  // The progressive index of the transitioner's navigation state.
  position: NavigationAnimatedValue,

  // The value that represents the progress of the transition when navigation
  // state changes from one to another. Its numberic value will range from 0
  // to 1.
  //  progress.__getAnimatedValue() < 1 : transtion is happening.
  //  progress.__getAnimatedValue() == 1 : transtion completes.
  progress: NavigationAnimatedValue,

  // All the scenes of the transitioner.
  scenes: Array<NavigationScene>,

  // The active scene, corresponding to the route at
  // `navigationState.routes[navigationState.index]`.
  scene: NavigationScene,

  // The gesture distance for `horizontal` and `vertical` transitions
  gestureResponseDistance?: ?number,

  // Optional custom transition config
  customTransitionConfig?: NavigationCustomTransitionConfig;
};

export type NavigationPanHandlerProps = NavigationSceneRendererProps & {
  onNavigateBack: ?Function,
  /**
  * The distance from the edge of the navigator which gesture response can start for.
  **/
  gestureResponseDistance: ?number,
};

export type SceneDimensions = {
  height: number,
  width: number,
};

export type NavigationTransitionStyleConfig = {
  // By default input range is defined as [index - 1, index, index + 1];
  // Input and output ranges must contain the same number of elements
  inputRange?: number[];
  opacityOutput: number | number[];
  scaleOutput: number | number[];
  translateXOutput: number | number[];
  translateYOutput: number | number[];
}

export type NavigationCustomTransitionConfig = {
  // Optional transition styles
  transitionStyle?: (sceneIndex: number, sceneDimensions: SceneDimensions) => NavigationTransitionStyleConfig;
  // Optional overrides for duration, easing, and timing
  transitionSpec?: NavigationTransitionSpec;
  // Optionally present the associated below the previous scene
  // When true the focused card in the stack will be presented below the previous card, 
  // but the nav stack order remains true to the NavigationScene order.
  // This option can be useful when paired with a custom transitionStyle 
  // if the next card should look as if it is presented below the currtent card when transitioning
  // and also when dragging to dismiss.
  presentBelowPrevious?: boolean;
}

// Similar to `NavigationTransitionProps`, except that the prop `scene`
// represents the scene for the renderer to render.
export type NavigationSceneRendererProps = NavigationTransitionProps;

export type NavigationPanPanHandlers = {
  onMoveShouldSetResponder: Function,
  onMoveShouldSetResponderCapture: Function,
  onResponderEnd: Function,
  onResponderGrant: Function,
  onResponderMove: Function,
  onResponderReject: Function,
  onResponderRelease: Function,
  onResponderStart: Function,
  onResponderTerminate: Function,
  onResponderTerminationRequest: Function,
  onStartShouldSetResponder: Function,
  onStartShouldSetResponderCapture: Function,
};

export type NavigationTransitionSpec = {
  duration?: number,
  // An easing function from `Easing`.
  easing?: () => any,
  // A timing function such as `Animated.timing`.
  timing?: (value: NavigationAnimatedValue, config: any) => any,
};

// Functions.

export type NavigationAnimationSetter = (
  position: NavigationAnimatedValue,
  newState: NavigationState,
  lastState: NavigationState,
) => void;

export type NavigationSceneRenderer = (
  props: NavigationSceneRendererProps,
) => ?React.Element<any>;

export type NavigationStyleInterpolator = (
  props: NavigationSceneRendererProps,
) => Object;
