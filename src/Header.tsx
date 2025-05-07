import React from 'react';

export const Header: React.FC = () => {
  return (
    <header
      className="navbar"
      style={{ backgroundColor: '#092812' }}
    >
      <span
        className="navbar-brand"
        style={{ fontWeight: 'bold', color: '#e4dcd3' }}
      >
        Harvest CV Editor
      </span>
      {/* <ul className="nav justify-content-end">
        <li>
          <a
            href="https://github.com/ronaldvandenbroek/json-visual-editor/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-comment" /> Feedback
          </a>
        </li>
      </ul> */}
    </header>
  );
};
