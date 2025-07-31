import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LayoutComponent {
  id: string;
  type: 'Hero Block' | 'Two Column Row' | '2x2 Image Grid';
}

interface ComponentsState {
  components: LayoutComponent[];
}

interface UndoableState {
  past: ComponentsState[];
  present: ComponentsState;
  future: ComponentsState[];
}

// Corrected: Define the payload type for the addComponent action
interface AddComponentPayload {
  id: string;
  type: LayoutComponent['type'];
}

const initialState: UndoableState = {
  past: [],
  present: { components: [] },
  future: [],
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<ComponentsState>) => {
      state.past = [];
      state.present = action.payload;
      state.future = [];
    },
    // Corrected: The reducer now accepts the Contentful 'sys.id' in its payload
    addComponent: (state, action: PayloadAction<AddComponentPayload>) => {
      state.past.push(state.present);
      state.present = {
        components: [...state.present.components, action.payload]
      };
      state.future = [];
    },
    reorderComponents: (state, action: PayloadAction<{ startIndex: number; endIndex: number }>) => {
      const { startIndex, endIndex } = action.payload;
      state.past.push(state.present);

      const newComponents = [...state.present.components];
      const [movedItem] = newComponents.splice(startIndex, 1);
      newComponents.splice(endIndex, 0, movedItem);

      state.present = { components: newComponents };
      state.future = [];
    },
    clearAll: (state) => {
      state.past.push(state.present);
      state.present = { components: [] };
      state.future = [];
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const previous = state.past.pop()!;
        state.future.unshift(state.present);
        state.present = previous;
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const next = state.future.shift()!;
        state.past.push(state.present);
        state.present = next;
      }
    },
  },
});

export const {
  setLayout,
  addComponent,
  reorderComponents,
  clearAll,
  undo,
  redo,
} = layoutSlice.actions;

export default layoutSlice.reducer;