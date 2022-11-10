import React from 'react'
import classNames from 'classnames'

export const Icon = ({ name, text, onClick }) => {
  const classes = classNames(name, 'fa-fw hmm', 'cursor-pointer')

  return (
    <i className={classes} onClick={onClick}>
      <span className="d-none">{text}</span>
    </i>
  )
}
