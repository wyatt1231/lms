import { Backdrop, Dialog, IconButton, useTheme } from "@material-ui/core";
import CancelPresentationRoundedIcon from "@material-ui/icons/CancelPresentationRounded";
import Axios from "axios";
import React, { FC, useEffect } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { setSnackbar } from "../Services/Actions/PageActions";

interface IFileViewer {
  location: string;
  handleClose?: () => void;
  doc_title: string;
  actions?: any;
  type?: "img" | "pdf" | "doc" | "pptx" | "";
}

const FileViewer: FC<IFileViewer> = ({
  location,
  handleClose,
  doc_title,
  type,
  actions,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;
    document.body.style.overflow = "hidden";

    console.log(`mounted`, mounted);

    const fetch = async () => {
      try {
        const response = await Axios.get(
          window.location.origin + "/" + location
        );
        console.log(`response`, response);
      } catch (error) {
        dispatch(setSnackbar(`No student file is attached`, `error`));
        handleClose();
      }
    };

    mounted && fetch();

    return () => {
      mounted = false;
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <Dialog open={true}>
      <StyledPdfPreview theme={theme} open={true}>
        <div className="header">
          <div className="start">
            <div className="start-item">
              <IconButton
                onClick={() => {
                  if (typeof handleClose === "function") {
                    handleClose();
                  }
                }}
              >
                <CancelPresentationRoundedIcon />
              </IconButton>
            </div>
            <div className="start-item"></div>
            <div className="start-item doc-title">{doc_title}</div>
          </div>
          <div className="center"></div>
          <div className="end">{actions}</div>
        </div>

        <div
          className="document"
          onContextMenu={(e) => {
            e.preventDefault();
          }}
        >
          {/* <Document
              file={URL.createObjectURL(
                FileUtils.Base64toBlob(file, "application/pdf")
              )}
            >
              <Page pageNumber={1} />
            </Document> */}
          <iframe
            id="iframe-pdf"
            title="pdf-frame"
            src={
              // URL.createObjectURL(
              //   FileUtils.Base64toBlob(file, "application/pdf")
              // ) + "#toolbar=0"

              window.location.origin + "/" + location + "#toolbar=0"
            }
            onError={() => {
              // alert(`error`);
              // setSnackbar(`File Note found`, `error`);
            }}
            onLoad={(e) => {
              console.log(`e--------------------------`, e);
              // alert(`loaded`);
            }}
            scrolling="auto"
            frameBorder="0"
            style={{
              minHeight: `100%`,
              height: `100%`,
              width: "80vw",
              maxWidth: "90vw",
              backgroundColor: `transparent`,
              overflow: `auto`,
            }}
          />
        </div>
      </StyledPdfPreview>
    </Dialog>
  );
};
export default FileViewer;

const StyledPdfPreview = styled(Backdrop)`
  .page-item {
    margin-bottom: 1.5em;
  }
  &.MuiBackdrop-root {
    z-index: ${(p) => p.theme.zIndex.drawer + 2};
    min-width: 100vw;
    min-height: 100vh;
    max-height: 100vh;
    overflow-y: auto;
    display: inline-block;
    background-color: rgba(0, 0, 0, 0.85);
    .MuiIconButton-root {
      color: #fff;
      /* background-color: blue; */
    }

    .header {
      position: sticky;
      top: 0;
      color: #fff !important;
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 1fr 1fr 1fr;
      padding: 1em;
      background-color: rgba(0, 0, 0, 0.1);
      box-shadow: 0 0 25px rgba(0, 0, 0, 0.2);
      align-items: center;
      align-content: center;
      .start {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        align-content: center;
        justify-content: start;
        grid-gap: 0.5em;
        font-weight: 600;
        text-shadow: 1px 1px 1px black;

        .doc-title {
          /* background-color: rgba(0, 0, 0, 0.2); */
          /* box-shadow: 0 0 50px rgba(0, 0, 0, 0.2); */
          border-radius: 20px;
          /* padding: 0.5em 0; */
        }
      }

      .center {
      }

      .end {
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        align-content: center;
        justify-content: end;
      }
    }
    .document {
      right: 30;
      display: grid;
      justify-content: center;
      justify-items: center;
      width: 100%;
      min-width: 100%;
      min-height: 85vh;
      max-height: 85vh;
    }
  }
`;
