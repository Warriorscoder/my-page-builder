import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './redux/store';
import {
  setLayout,
  addComponent,
  reorderComponents,
  undo,
  redo,
  clearAll,
  LayoutComponent,
} from './redux/layoutSlice';
import styles from './App.module.css';

// --- Helper Component for Visual Previews ---
const ComponentPreview = ({ type }: { type: LayoutComponent['type'] }) => {
  if (type === 'Hero Block') {
    return (
      <div className={styles.previewBox}>
        <div className={styles.previewHero}></div>
        <div className={styles.previewLine}></div>
        <div className={styles.previewLineShort}></div>
      </div>
    );
  }
  if (type === 'Two Column Row') {
    return (
      <div className={styles.previewBox}>
        <div className={styles.previewTwoCol}>
          <div>
            <div className={styles.previewLine}></div>
            <div className={styles.previewLineShort}></div>
          </div>
          <div className={styles.previewImage}></div>
        </div>
      </div>
    );
  }
  if (type === '2x2 Image Grid') {
    return (
      <div className={styles.previewBox}>
        <div className={styles.previewGrid}>
          <div className={styles.previewImage}></div>
          <div className={styles.previewImage}></div>
          <div className={styles.previewImage}></div>
          <div className={styles.previewImage}></div>
        </div>
      </div>
    );
  }
  return null;
};

// --- Styled Draggable Item for the Sidebar ---
function DraggableSidebarItem({ type }: { type: LayoutComponent['type'] }) {
  return (
    <div className={styles.sidebarItem}>
      <div className={styles.sidebarItemPreview}>
        <ComponentPreview type={type} />
      </div>
      <div className={styles.sidebarItemName}>{type}</div>
    </div>
  );
}

// --- Main App Component ---
const App = () => {
  const sdk = useSDK();
  const dispatch = useDispatch<AppDispatch>();
  const layoutState = useSelector((state: RootState) => state.layout);

  // Guard to wait for Redux state to be rehydrated and have the correct shape.
  if (!layoutState || !layoutState.present) {
    return null;
  }

  const { past, present, future } = layoutState;
  const components = present.components;

  const availableComponents: LayoutComponent['type'][] = [
    'Hero Block',
    'Two Column Row',
    '2x2 Image Grid',
  ];

  // Helper function to convert human-readable type to Contentful ID
  const typeMap = {
    'Hero Block': 'heroBlock',
    'Two Column Row': 'twoColumnRow',
    '2x2 Image Grid': 'x2ImageGrid',
  };

  // Asynchronous function to create a new Contentful entry and get its ID
  const createAndAddComponent = async (type: LayoutComponent['type']) => {
    try {
      const entryId = typeMap[type];
      const newEntry = await sdk.space.createEntry(entryId, {
        fields: {
          // You might need to set default values here if fields are required
        }
      });
      // Dispatch the addComponent action with the new entry's sys.id
      dispatch(addComponent({ id: newEntry.sys.id, type }));
    } catch (error) {
      console.error('Failed to create new entry:', error);
    }
  };

  React.useEffect(() => {
    if (!('entry' in sdk)) return;
    const initialValue = sdk.entry.fields.layoutConfig.getValue();
    if (initialValue && Array.isArray(initialValue.components)) {
      dispatch(setLayout(initialValue));
    }
  }, [sdk, dispatch]);

  React.useEffect(() => {
    if (!('entry' in sdk)) return;
    const handler = setTimeout(() => {
      if (components && sdk.entry.fields.layoutConfig) {
        sdk.entry.fields.layoutConfig.setValue(present);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [present, sdk]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (source.droppableId === 'sidebar') {
      const type = availableComponents[source.index];
      // Call the async function to create the entry and add it
      createAndAddComponent(type);
    } else if (source.droppableId === 'canvas-droppable') {
      dispatch(reorderComponents({ startIndex: source.index, endIndex: destination.index }));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <h3>Available Components</h3>
          <Droppable droppableId="sidebar" isDropDisabled={true}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {availableComponents.map((type, index) => (
                  <Draggable key={type} draggableId={type} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <DraggableSidebarItem type={type} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.toolbar}>
            <button onClick={() => dispatch(undo())} disabled={past.length === 0}>Undo</button>
            <button onClick={() => dispatch(redo())} disabled={future.length === 0}>Redo</button>
            <button
              onClick={() => dispatch(clearAll())}
              disabled={components.length === 0}
              className={styles.clearButton}
            >
              Clear All
            </button>
          </div>
          <Droppable droppableId="canvas-droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className={styles.canvas}>
                {components.length > 0 ? (
                  components.map((component, index) => (
                    <Draggable key={component.id} draggableId={component.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={styles.canvasItem}
                        >
                          {component.type}
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <p>Drag components here to build your page.</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
};

export default App;