import React from "react";
import MultiSelect from "react-native-multiple-select";

const SubjectMultiselect = (subjects, selectedSubjects, setSelectedSubjects) =>{
    return (
        <MultiSelect
            items={subjects}
            selectedItems={selectedSubjects}
            onSelectedItemsChange={(selectedItems)=>setSelectedSubjects(selectedItems)}
            selectText="Escoge asignaturas"
            searchInputPlaceholderText="Buscar asignaturas..."
            noItemsText="No se encuentran coincidencias"
            submitButtonText="Añadir asignaturas"
            hideSubmitButton
            styleTextDropdown={{marginLeft:10}}
            styleTextDropdownSelected={{marginLeft:10}}
            searchInputStyle={{height:40}}
            styleDropdownMenuSubsection={{borderRadius: 25}}
            tagContainerStyle={{
              maxWidth: '90%'
            }}
            hideDropdown
            textInputProps={{autoFocus:false}}
            displayKey="name"
            uniqueKey="id"
        />
    );
}

export default SubjectMultiselect;