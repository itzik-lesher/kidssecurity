import { forwardRef, useImperativeHandle, useEffect} from 'react';
import { View, Button } from 'react-native';

import {
  useRingerMode,
  RINGER_MODE,
  checkDndAccess,
  requestDndAccess,
  RingerModeType,
} from 'react-native-volume-manager';


import { create } from 'zustand';

//////////  Zustand  ///////////////
// the source is here:
//https://github.com/pmndrs/zustand

export const useStore = create((set, get) => ({

  triggerFunction: null,
  setTriggerFunction: (fn) => set({ triggerFunction: fn }),
  executeTriggerFunction: () => {
  const { triggerFunction } = get();
  if (triggerFunction) triggerFunction();
  },
  
  isFunctionCalled: false,

  // Define function to call component function
  callComponentFunction: () => {
    set({ isFunctionCalled: true });
  },

  // Reset function
  reset: () => {
    set({ isFunctionCalled: false });
  },

  // Define Zustand state properties
  volumeIsNormal: false,

  // Define function to update Zustand state using component state value
  //setVolumIsNormal: (value) => set({ volumeIsNormal: value }),
  setVolumeIsNormalTrue: () => {
    set({ volumeIsNormal: true });
  },

  // Reset function
  setVolumeIsNormalFalse: () => {
    set({ volumeIsNormal: false });
  },



  }));
//////////  Zustand  End ///////////////

const  VolumeManager = forwardRef((props, ref) => {
  const { mode, setMode } = useRingerMode();
  const isFunctionCalled = useStore((state) => state.isFunctionCalled);
  // this function is exposed by useImperativeHandle to ManageUserScreen
  const setVolNormal = () =>{
    return changeMode(RINGER_MODE.normal);
  }
  useEffect(()=>{
    changeMode(RINGER_MODE.normal)
  },[isFunctionCalled])




  useImperativeHandle(ref, () => {
    return {
      exposedSetVolumeNormal: setVolNormal,
    };
  });


  // Add hook of Zustand for variable
  //const bears = useVolumeMgr((state) => state.bears)
  //console.log('bears',bears);

  //const volume = useVolumeMgr((state) => state.volume)
  //console.log('volume', volume);
  console.log('inside VolumeManager');
  
  // Add hook of Zustand for function call
  //const setVolVibration = useVolumeMgr((state) => state.setVolumeVibration);

  //console.log('counref', countRef);
  
  const changeMode = async (newMode) => {
    console.log('inside changeMode')
    console.log('newMode',newMode)
    // use useZustand
    //setVolVibration();

    // From N onward, ringer mode adjustments that would toggle Do Not Disturb
    // are not allowed unless the app has been granted Do Not Disturb Access.
    // @see https://developer.android.com/reference/android/media/AudioManager#setRingerMode(int)
    if (newMode === RINGER_MODE.silent || mode === RINGER_MODE.silent) {
      const hasDndAccess = await checkDndAccess();
      if (hasDndAccess === false) {
        // This function opens the DND settings.
        // You can ask user to give the permission with a modal before calling this function.
        requestDndAccess();
        return;
      }
    }

    setMode(newMode);
  };

    const setTriggerFunction = useStore((state) => state.setTriggerFunction);
    
    useEffect(() => {
    
    setTriggerFunction(myFunction);
    
    }, []);
    
    const myFunction = () => {
    console.log("Function in Component A triggered!");

    changeMode(RINGER_MODE.normal)
    };
    
    
  /*
  return (
    <View>
      <Button title="Silent" onPress={() => changeMode(RINGER_MODE.silent)} />
      <Button title="Normal" onPress={() => changeMode(RINGER_MODE.normal)} />
      <Button title="Vibrate" onPress={() => changeMode(RINGER_MODE.vibrate)} />
    </View>
  );
  */
   //Don't need Gui in this componenet
   return null;

})

export default VolumeManager;