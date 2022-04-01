import { FixtureList, RendererId } from '../../../renderer/types';
import { FixtureState } from '../../../utils/fixtureState/types';
import { MessageType, StateUpdater } from '../../../utils/types';

export type RendererCoreSpec = {
  name: 'rendererCore';
  state: {
    connectedRendererIds: RendererId[];
    primaryRendererId: null | RendererId;
    fixtures: FixtureList;
    fixtureState: FixtureState;
  };
  methods: {
    getConnectedRendererIds(): RendererId[];
    getPrimaryRendererId(): null | RendererId;
    getFixtures(): FixtureList;
    getFixtureState(): FixtureState;
    isRendererConnected(): boolean;
    isValidFixtureSelected(): boolean;
    setFixtureState(stateUpdater: StateUpdater<FixtureState>): void;
    selectPrimaryRenderer(primaryRendererId: RendererId): void;
    receiveResponse(msg: MessageType): void;
  };
  events: {
    request(msg: MessageType): void;
    response(msg: MessageType): void;
  };
};