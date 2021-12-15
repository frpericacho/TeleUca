import React from "react";
import MultiSelect from "react-native-multiple-select";
import fetchSubjects from "./firebaseAPI";

const CareerMultiselect = async (careers, selectedCareer, subjects, setSelectedCareer, setSelected) => {
    return(
        <MultiSelect
            items={careers}
            selectedItems={selectedCareer}
            onSelectedItemsChange={(selectedItems)=>{setSelectedCareer(selectedItems); setSelected(true); fetchSubjects(selectedItems[0], subjects)}}
            selectText="Escoge titulación"
            searchInputPlaceholderText="Buscar titulaciones..."
            noItemsText="No se encuentran coincidencias"
            styleTextDropdown={{marginLeft:10}}
            styleTextDropdownSelected={{marginLeft:10}}
            searchInputStyle={{height:40}}
            hideDropdown
            single
            textInputProps={{autoFocus:false}}
            displayKey="name"
            uniqueKey="name"
      />
    );
}

export default CareerMultiselect;