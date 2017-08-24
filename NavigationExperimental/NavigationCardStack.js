/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Facebook, Inc. ("Facebook") owns all right, title and interest, including
 * all intellectual property and other proprietary rights, in and to the React
 * Native CustomComponents software (the "Software").  Subject to your
 * compliance with these terms, you are hereby granted a non-exclusive,
 * worldwide, royalty-free copyright license to (1) use and copy the Software;
 * and (2) reproduce and distribute the Software as part of your own software
 * ("Your Software").  Facebook reserves all rights not expressly granted to
 * you in this license agreement.
 *
 * THE SOFTWARE AND DOCUMENTATION, IF ANY, ARE PROVIDED "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES (INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE) ARE DISCLAIMED.
 * IN NO EVENT SHALL FACEBOOK OR ITS AFFILIATES, OFFICERS, DIRECTORS OR
 * EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @providesModule NavigationCardStack
 * @flow
 */
'use strict';

const { PropTypes } = require('prop-types');

import {
  StyleSheet,
  View,
} from 'react-native';

const React = require('react');

const NavigationCard = require('./NavigationCard');
const NavigationCardStackPanResponder = require('./NavigationCardStackPanResponder');
const NavigationCardStackStyleInterpolator = require('./NavigationCardStackStyleInterpolator');
const NavigationPropTypes = require('./NavigationPropTypes');
const NavigationTransitioner = require('./NavigationTransitioner');

const { Directions } = NavigationCardStackPanResponder;

import {
  NavigationState,
  NavigationSceneRenderer,
  NavigationSceneRendererProps,
  NavigationTransitionProps,
  NavigationAnimatedValue,
  NavigationCustomTransitionConfig,
  NavigationPanHandlerProps,
} from './NavigationTypeDefinition';

import type {
  NavigationGestureDirection,
} from 'NavigationCardStackPanResponder';

type SceneDimensions = {
  height: number;
  width: number;
};

type Props = {
  direction: NavigationGestureDirection,
  customTransitionConfig?: NavigationCustomTransitionConfig,
  navigationState: NavigationState,
  onNavigateBack?: Function,
  onTransitionStart?: (a: NavigationTransitionProps, b: ?NavigationTransitionProps) => void,
  onTransitionEnd?: () => void,
  renderHeader: ?NavigationSceneRenderer,
  renderScene: NavigationSceneRenderer,
  cardStyle?: any,
  style: any,
  hideShadow?: boolean,
  gestureResponseDistance?: ?number,
  enableGestures: ?boolean,
  scenesStyle?: any,
};

type DefaultProps = {
  direction: NavigationGestureDirection,
  enableGestures: boolean
};

/**
 * A controlled navigation view that renders a stack of cards.
 *
 * ```html
 *     +------------+
 *   +-|   Header   |
 * +-+ |------------|
 * | | |            |
 * | | |  Focused   |
 * | | |   Card     |
 * | | |            |
 * +-+ |            |
 *   +-+            |
 *     +------------+
 * ```
 *
 * ## Example
 *
 * ```js
 *
 * class App extends React.Component {
 *   constructor(props, context) {
 *     this.state = {
 *       navigation: {
 *         index: 0,
 *         routes: [
 *           {key: 'page 1'},
 *         },
 *       },
 *     };
 *   }
 *
 *   render() {
 *     return (
 *       <NavigationCardStack
 *         navigationState={this.state.navigation}
 *         renderScene={this._renderScene}
 *       />
 *     );
 *   }
 *
 *   _renderScene: (props) => {
 *     return (
 *       <View>
 *         <Text>{props.scene.route.key}</Text>
 *       </View>
 *     );
 *   };
 * ```
 */
class NavigationCardStack extends React.PureComponent<DefaultProps, Props, void> {
  _render : NavigationSceneRenderer;
  _renderScene : NavigationSceneRenderer;
  _configureTransition: NavigationTransitionSpec;

  static propTypes = {
    /**
     * Custom style applied to the card.
     */
    cardStyle: PropTypes.any,

    /**
     * Optional custom transition config
     */
    customTransitionConfig: NavigationPropTypes.customTransitionConfig,

    /**
     * Direction of the cards movement. Value could be `horizontal` or
     * `vertical`. Default value is `horizontal`.
     */
    direction: PropTypes.oneOf([Directions.HORIZONTAL, Directions.VERTICAL, Directions.FADE]),

    /**
     * The distance from the edge of the card which gesture response can start
     * for. Defaults value is `30`.
     */
    gestureResponseDistance: PropTypes.number,

    /**
     * Enable gestures. Default value is true.
     *
     * When disabled, transition animations will be handled natively, which
     * improves performance of the animation. In future iterations, gestures
     * will also work with native-driven animation.
     */
    enableGestures: PropTypes.bool,

    /**
     * Hide the drop shadow applied to cards in the stack.
     */
    hideShadow: PropTypes.bool,

    /**
     * The controlled navigation state. Typically, the navigation state
     * look like this:
     *
     * ```js
     * const navigationState = {
     *   index: 0, // the index of the selected route.
     *   routes: [ // A list of routes.
     *     {key: 'page 1'}, // The 1st route.
     *     {key: 'page 2'}, // The second route.
     *   ],
     * };
     * ```
     */
    navigationState: NavigationPropTypes.navigationState.isRequired,

    /**
     * Callback that is called when the "back" action is performed.
     * This happens when the back button is pressed or the back gesture is
     * performed.
     */
    onNavigateBack: PropTypes.func,

    /**
     * Function that renders the header.
     */
    renderHeader: PropTypes.func,

    /**
     * Function that renders the a scene for a route.
     */
    renderScene: PropTypes.func.isRequired,

    /**
     * Custom style applied to the cards stack.
     */
    style: View.propTypes.style,

    /**
     * Custom style applied to the scenes stack.
     */
    scenesStyle: View.propTypes.style,
  };

  static defaultProps: DefaultProps = {
    direction: Directions.HORIZONTAL,
    enableGestures: true,
  };

  constructor(props: Props, context: any) {
    super(props, context);
  }

  componentWillMount(): void {
    this._render = this._render.bind(this);
    this._renderScene = this._renderScene.bind(this);
    this._configureTransition = this._configureTransition.bind(this);
  }

  render(): React.Element<any> {
    return (
      <NavigationTransitioner
        configureTransition={this._configureTransition}
        navigationState={this.props.navigationState}
        onTransitionEnd={this.props.onTransitionEnd}
        onTransitionStart={this.props.onTransitionStart}
        render={this._render}
        style={this.props.style}
      />
    );
  }

  _configureTransition(a: NavigationTransitionProps, b: NavigationTransitionProps): NavigationTransitionSpec {
    const isVertical = this.props.direction === 'vertical';
    const {
      customTransitionConfig,
    } = this.props;
    const animationConfig = customTransitionConfig ? customTransitionConfig.transitionSpec : null;

    if (NavigationCardStackStyleInterpolator.canUseNativeDriver(isVertical)) {
      // TODO(adcom): If customTransitionConfig is specified, should we be overriding useNativeDriver?
      return Object.assign({}, animationConfig, {
        useNativeDriver: true
      });
    }

    return animationConfig;
  }

  _render(props: NavigationTransitionProps): React.Element<any> {
    const {
      customTransitionConfig,
      renderHeader
    } = this.props;

    const header = renderHeader ? <View>{renderHeader(props)}</View> : null;
    
    // Conditionally swap the order of the last 2 scenes 
    const orderedScenes = props.scenes.slice();
    if (orderedScenes.length > 1 
        && customTransitionConfig 
        && customTransitionConfig.presentBelowPrevious) {
      const lastIndex = orderedScenes.length - 1;
      const topScene = orderedScenes[lastIndex];
      orderedScenes[lastIndex] = orderedScenes[lastIndex - 1];
      orderedScenes[lastIndex - 1] = topScene;
    }

    const scenes = orderedScenes.map(
     scene => this._renderScene({
       ...props,
       scene,
     })
    );

    return (
      <View style={styles.container}>
        <View
          style={[styles.scenes, this.props.scenesStyle]}>
          {scenes}
        </View>
        {header}
      </View>
    );
  }

  _renderScene(props: NavigationSceneRendererProps): React.Element<any> {
    let style;

    const panHandlersProps = {
      ...props,
      onNavigateBack: this.props.onNavigateBack,
      gestureResponseDistance: this.props.gestureResponseDistance,
    };

    if (this.props.customTransitionConfig) {
      const transitionConfig = this.props.customTransitionConfig.transitionStyle(
        props.scene.index, 
        { width: props.layout.initWidth, height: props.layout.initHeight }
      );
      style = NavigationCardStackStyleInterpolator.forConfig(transitionConfig, props);
    } else if (this.props.direction === 'vertical') {
      style = NavigationCardStackStyleInterpolator.forVertical(props);
    } else if (this.props.direction === 'horizontal') {
       style = NavigationCardStackStyleInterpolator.forHorizontal(props);
    } else {
      style = NavigationCardStackStyleInterpolator.forFade(props);
    }

    const panHandlers = this._panHandlerForProps(panHandlersProps);

    return (
      <NavigationCard
        {...props}
        key={'card_' + props.scene.key}
        panHandlers={panHandlers}
        renderScene={this.props.renderScene}
        style={[style, this.props.cardStyle]}
        hideShadow={this.props.hideShadow}
      />
    );
  }

  _panHandlerForProps(panHandlersProps: NavigationPanHandlerProps): NavigationPanPanHandlers {
    if (this.props.enableGestures) {
      if (this.props.direction === 'vertical') {
        return NavigationCardStackPanResponder.forVertical(panHandlersProps);
      } else if (this.props.direction === 'horizontal') {
        return NavigationCardStackPanResponder.forHorizontal(panHandlersProps);
      } else if (this.props.direction === 'fade') {
        return NavigationCardStackPanResponder.forFade(panHandlersProps);
      }
    }
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Header is physically rendered after scenes so that Header won't be
    // covered by the shadows of the scenes.
    // That said, we'd have use `flexDirection: 'column-reverse'` to move
    // Header above the scenes.
    flexDirection: 'column-reverse',
  },
  scenes: {
    flex: 1,
  },
});

module.exports = NavigationCardStack;
