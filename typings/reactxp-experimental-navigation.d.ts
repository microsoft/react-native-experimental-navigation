declare module 'reactxp-experimental-navigation' {
    import {
        Animated,
        PanResponderGestureState,
        ReactElement,
        ResponderSyntheticEvent
    } from 'react-native';

    import React = require('react');

    type NavigationAnimatedValue = Animated.Value;

    // Value  & Structs.
    type NavigationGestureDirection = 'horizontal' | 'vertical' | 'fade';

    interface NavigationRoute {
        key: string;
        title?: string;
    }

    interface NavigationState {
        index: number;
        routes: NavigationRoute[];
    }

    type NavigationLayout = {
        height: NavigationAnimatedValue,
        initHeight: number,
        initWidth: number,
        isMeasured: boolean,
        width: NavigationAnimatedValue,
    };

    type NavigationScene = {
        index: number,
        isActive: boolean,
        isStale: boolean,
        key: string,
        route: NavigationRoute,
    };

    type NavigationTransitionProps = {
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
        scenes: NavigationScene[],

        // The active scene, corresponding to the route at
        // `navigationState.routes[navigationState.index]`.
        scene: NavigationScene,

        // The gesture distance for `horizontal` and `vertical` transitions
        gestureResponseDistance?: number|null,
    };

    type NavigationSceneRendererProps = NavigationTransitionProps;

    type NavigationPanPanHandlers = {
        onMoveShouldSetResponder: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onMoveShouldSetResponderCapture: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onResponderEnd: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onResponderGrant: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onResponderMove: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onResponderReject: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onResponderRelease: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onResponderStart: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onResponderTerminate: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onResponderTerminationRequest: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void | boolean,
        onStartShouldSetResponder: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void,
        onStartShouldSetResponderCapture: (e: ResponderSyntheticEvent, gestureState: PanResponderGestureState) => void,
    };

    type NavigationTransitionSpec = {
        duration?: number,
        // An easing function from `Easing`.
        easing?: (input: number) => number,
        // A timing function such as `Animated.timing`.
        timing?: (value: NavigationAnimatedValue, config: any) => any,
    };

    type SceneDimensions = {
        height: number,
        width: number,
    };

    type NavigationTransitionStyleConfig = {
        // By default input range is defined as [index - 1, index, index + 1];
        // Input and output ranges must contain the same number of elements
        inputRange?: number[];
        opacityOutput: number | number[];
        scaleOutput: number | number[];
        translateXOutput: number | number[];
        translateYOutput: number | number[];
    }

    type NavigationCustomTransitionConfig = {
        // Optional transition styles
        transitionStyle?: (sceneIndex: number, sceneDimensions: SceneDimensions) => NavigationTransitionStyleConfig;
        // Optional overrides for duration, easing, and timing
        transitionSpec?: NavigationTransitionSpec;
        // Optionally present the associated below the previous scene
        presentBelowPrevious?: boolean;
    }

    // Functions.
    type NavigationAnimationSetter = (
        position: NavigationAnimatedValue,
        newState: NavigationState,
        lastState: NavigationState
    ) => void;

    type NavigationSceneRenderer = (
        props: NavigationSceneRendererProps
    ) => ReactElement<any>;

    type NavigationStyleInterpolator = (
        props: NavigationSceneRendererProps
    ) => Object;

    module StateUtils {

        /**
         * Searches for state with given key inside of given ParentNavigationState
         * returns null in case nothing found or getParent(state) == null
         */
        function get(state: NavigationState, key: string): NavigationRoute|undefined|null;

        /**
         * returns index of the state with key in given ParentNavigationState
         * returns null if key not found of getParent(state) == null
         */
        function indexOf(state: NavigationState, key: string): number;

        /**
         * Returns `true` at which a given route's key can be found in the
         * routes of the navigation state.
         */
        function has(state: NavigationState, key: string): boolean;

        /**
         * Pushes newChildState into parent state
         */
        function push(state: NavigationState, newChildState: NavigationRoute): NavigationState;

        /**
         * pops out latest state in the existing Parent
         */
        function pop(state: NavigationState): NavigationState;

        /**
         * If this function gets the same index as currently set it returns the same state
         * in other case it would clone previous state and updates the index
         *
         * it looks like it designed to get NavigationParentState only as otherwise it just will return corrupted object without
         * key attribute or even crash depending on how ... operator would work with null value
         */
        function jumpToIndex(state: NavigationState, index: number): NavigationState;

        /**
         * Same as the previous function but search index by the key first
         *
         * would crash if given key is not found
         */
        function jumpTo(state: NavigationState, key: string): NavigationState;

        /**
         * Sets the focused route to the previous route.
         */
        function back(state: NavigationState): NavigationState;

        /**
         * Sets the focused route to the next route.
         */
        function forward(state: NavigationState): NavigationState;

        /**
         * This function wouldn't modify your state unless it's NavigationParentState
         * if this is a parent state it would clone the children array
         * and will try to relplace item in this array by the newState
         *
         * if there is no item with such key it would crash
         */
        function replaceAt(state: NavigationState, key: string, newState: NavigationState): NavigationState;

        /**
         * the same as the previous function but it replaces item directly by the index
         */
        function replaceAtIndex(state: NavigationState, index: number, route: NavigationRoute): NavigationState;

        /**
         * if nextChildren is null parentState.children would be used
         * if nextIndex is null, parent nextIndex would be used
         */
        function reset(state: NavigationState, nextChildren?: NavigationRoute[], index?: number): NavigationState;
    }

    type NavigationTransitionerProps = {
        configureTransition: (
            a: NavigationTransitionProps,
            b?: NavigationTransitionProps
        ) => NavigationTransitionSpec,
        navigationState: NavigationState,
        onTransitionEnd: () => void,
        onTransitionStart: (transitionProps: NavigationTransitionProps, prevTransitionProps?: NavigationTransitionProps) => void,
        render: (transitionProps: NavigationTransitionProps, prevTransitionProps?: NavigationTransitionProps) => ReactElement<any>,
        style: any,
    };

    type NavigationTransitionerState = {
        layout: NavigationLayout,
        position: NavigationAnimatedValue,
        progress: NavigationAnimatedValue,
        scenes: NavigationScene[],
    };

    class NavigationTransitioner extends React.Component<NavigationTransitionerProps, NavigationTransitionerState> {
    }

    type SceneViewProps =  {
        sceneRenderer: NavigationSceneRenderer,
        sceneRendererProps: NavigationSceneRendererProps,
    };

    class SceneView extends React.Component<SceneViewProps, any> {
    }

    type NavigationCardProps = NavigationSceneRendererProps & {
        onComponentRef: (ref: any) => void,
        onNavigateBack?: (action: any) => void,
        panHandlers?: NavigationPanPanHandlers,
        pointerEvents: string,
        renderScene: NavigationSceneRenderer,
        style: any,
    };

    class Card extends React.Component<NavigationCardProps, any> {

    }

    type NavigationCardStackProps = {
        direction: NavigationGestureDirection,
        customTransitionConfig?: NavigationCustomTransitionConfig,
        navigationState: NavigationState,
        onNavigateBack?: (action: any) => void,
        onTransitionStart?: (transitionProps: NavigationTransitionProps, prevTransitionProps?: NavigationTransitionProps) => void,
        onTransitionEnd?: () => void,
        renderHeader?: NavigationSceneRenderer,
        renderScene: NavigationSceneRenderer,
        cardStyle?: any,
        hideShadow?: boolean,
        style?: any,
        gestureResponseDistance?: number|null,
        enableGestures? : boolean
    };

    class CardStack extends React.Component<NavigationCardStackProps, {}> {

    }

    type NavigationHeaderProps = NavigationSceneRendererProps & {
        onNavigateBack?: (action: any) => void,
        renderLeftComponent: NavigationSceneRenderer,
        renderRightComponent: NavigationSceneRenderer,
        renderTitleComponent: NavigationSceneRenderer,
        style?: any,
        viewProps?: any,
        statusBarHeight: number | Animated.Value,
    };

    class NavigationHeader extends React.Component<NavigationHeaderProps, any> {

    }
}
