import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Clipboard from 'clipboard';
import { saveAs } from 'file-saver';
import { RootState } from '.';
import { dataSlice } from './features/data/dataSlice';
import { ValidityType, textareaSlice } from './features/textarea/textareaSlice';

const ControlsArea: React.FC = () => {
  useEffect(() => {
    // init clipboard
    new Clipboard('#copy-to-clipboard');
  }, []);

  const downloadJson = (text: string) => {
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    saveAs(blob, 'data.json');
  };

  const dispatch = useDispatch();
  const { setData, pasteSample } = dataSlice.actions;
  const { setLocalText } = textareaSlice.actions;
  

  const text = useSelector((state: RootState) => state.textarea.localText);
  const isEmpty = useMemo(() => text.length === 0, [text.length]);
  const isValid = useSelector(
    (state: RootState) => state.textarea.validity === ValidityType.Valid
  );

  const onDeleteButtonClicked = useCallback(() => {
    dispatch(setData(null));
    dispatch(setLocalText(''));
  }, [dispatch, setData, setLocalText]);

  const onFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target?.result as string);
            dispatch(setData(json));
            dispatch(setLocalText(JSON.stringify(json, null, 2)));
          } catch (error) {
            console.error('Invalid JSON file:', error);
          }
        };
        reader.readAsText(file);
      }
    },
    [dispatch, setData, setLocalText]
  );

  const onPdfUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          // Mock PDF to JSON conversion
          const sampleJson = {
            name: "Sample PDF Data",
            content: "This is a mock conversion of PDF to JSON.",
            fileName: file.name,
          };
          dispatch(setData(sampleJson));
          dispatch(setLocalText(JSON.stringify(sampleJson, null, 2)));
        };
        reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
      }
    },
    [dispatch, setData, setLocalText]
  );

  const onPasteExampleJson = useCallback(() => {
    dispatch(pasteSample());
  }, [dispatch, pasteSample]);

  return (
    <nav className="navbar px-1 py-0" style={{ overflow: 'visible' }}>
      <ul className="nav">
        <li className="nav-item">
          <button
            id="copy-to-clipboard"
            data-clipboard-target="#json-text"
            disabled={!isValid}
            className="btn btn-link"
            title="Copy"
          >
            <i className="far fa-copy" />
          </button>
        </li>
        <li className="nav-item">
          <button
            id="donwload"
            disabled={!isValid}
            className="btn btn-link"
            onClick={() => downloadJson(text)}
            title="Download"
          >
            <i className="fas fa-file-download" />
          </button>
        </li>
        <li className="nav-item">
          <button
            className="btn btn-link"
            disabled={isEmpty}
            onClick={onDeleteButtonClicked}
            title="Clear"
          >
            <i className="far fa-trash-alt" />
          </button>
        </li>
        <li className="nav-item">
          <label className="btn btn-link" title="Upload JSON">
            <i className="fas fa-file-upload" />
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={onFileUpload}
            />
          </label>
        </li>
        <li className="nav-item">
          <label className="btn btn-link" title="Upload PDF">
            <i className="fas fa-file-pdf" />
            <input
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={onPdfUpload}
            />
          </label>
        </li>
        <li className="nav-item">
          <button
            className="btn btn-link"
            title="Paste Example JSON"
            onClick={onPasteExampleJson}
          >
            <i className="fas fa-paste" />
          </button>
        </li>
      </ul>
      <ul className="nav justify-content-end">
        <li className="control-count nav-item">
          <span
            className={`text-count ${
              text.length > 0 && !isValid ? 'invalid' : ''
            }`}
          >
            {text.length}
          </span>
        </li>
      </ul>
    </nav>
  );
};

export default ControlsArea;
