import React, { useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Clipboard from 'clipboard';
import { saveAs } from 'file-saver';
import { RootState } from '.';
import { dataSlice } from './features/data/dataSlice';
import { ValidityType, textareaSlice } from './features/textarea/textareaSlice';
import config from './config'; // Import the config file

const ControlsArea: React.FC = () => {
  useEffect(() => {
    // init clipboard
    new Clipboard('#copy-to-clipboard');
  }, []);

  const downloadJson = (text: string) => {
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    saveAs(blob, 'data.json');
  };

  const downloadTextCV = (text: string) => {
    try {
      const json = JSON.parse(text);

      const generateText = (obj: any, indent = 0): string => {
        return Object.entries(obj)
          .map(([key, value]) => {
            const indentation = '  '.repeat(indent);
            if (typeof value === 'object' && value !== null) {
              return `${indentation}${key}:\n${generateText(value, indent + 1)}`;
            }
            return `${indentation}${key}: ${value}`;
          })
          .join('\n');
      };

      const textCV = generateText(json);
      const blob = new Blob([textCV], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, 'CV.txt');
    } catch (error) {
      alert('Invalid JSON format. Unable to generate CV.');
    }
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
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const apiUrl = config.BACKEND_API_URL;
          if (!apiUrl) {
            throw new Error('API URL is not defined in the configuration.');
          }

          const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const json = await response.json();
          dispatch(setData(json));
          dispatch(setLocalText(JSON.stringify(json, null, 2)));
        } catch (error) {
          console.error('Failed to upload PDF:', error);
        }
      }
    },
    [dispatch, setData, setLocalText]
  );

  const onPasteExampleJson = useCallback(() => {
    dispatch(pasteSample());
  }, [dispatch, pasteSample]);

  const saveExampleCV = useCallback(() => {
    alert('Mock save operation: Saving current JSON as example CV');
  }, []);

  return (
    <nav className="navbar px-1 py-0 d-flex align-items-center justify-content-between" style={{ overflow: 'visible' }}>
      <div
        className="d-flex align-items-center"
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          padding: '5px',
          marginRight: '10px',
          marginBottom: '5px',
          flexDirection: 'column',
        }}
      >
        <span
          style={{
            fontWeight: 'bold',
            color: '#092812',
            textAlign: 'center',
          }}
        >
          CV Builder
        </span>
        <ul className="nav">
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
              title="Save as Example CV"
              onClick={saveExampleCV}
              disabled={isEmpty}
            >
              <i className="fas fa-save" />
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-link"
              title="Download Text CV"
              onClick={() => downloadTextCV(text)}
              disabled={!isValid}
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
        </ul>
      </div>
      <div className="d-flex align-items-center justify-content-end" style={{ flexGrow: 1 }}>
        <div
          className="d-flex align-items-center"
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
            padding: '5px',
            marginRight: '10px',
            marginBottom: '5px',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              fontWeight: 'bold',
              color: '#092812',
              textAlign: 'center',
            }}
          >
            Debug
          </span>
          <ul className="nav">
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
              <button
                className="btn btn-link"
                title="Paste Example JSON"
                onClick={onPasteExampleJson}
              >
                <i className="fas fa-paste" />
              </button>
            </li>
            <li className="nav-item">
              <button
                id="download"
                disabled={!isValid}
                className="btn btn-link"
                onClick={() => downloadJson(text)}
                title="Download JSON"
              >
                <i className="fas fa-file-alt" />
              </button>
            </li>
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
          </ul>
        </div>
        <ul className="nav">
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
      </div>
    </nav>
  );
};

export default ControlsArea;
