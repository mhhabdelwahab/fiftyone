"""
FiftyOne Zoo Datasets provided natively by the library.

| Copyright 2017-2020, Voxel51, Inc.
| `voxel51.com <https://voxel51.com/>`_
|
"""
import logging
import os

import eta.core.serial as etas
import eta.core.utils as etau
import eta.core.web as etaw

import fiftyone.types as fot
import fiftyone.zoo as foz


logger = logging.getLogger(__name__)


class FiftyOneDataset(foz.ZooDataset):
    """Base class for zoo datasets that are provided natively by FiftyOne."""

    pass


class QuickstartDataset(FiftyOneDataset):
    """A small dataset with ground truth bounding boxes and predictions.

    The dataset consists of XXX images from the validation split of COCO-2017,
    and the model predictions were generated by an out-of-the-box Faster R-CNN
    model from ``torchvision.models``.

    Dataset size:
        XX.XX MiB
    """

    _GDRIVE_ID = "1Clg45_r7ApaSypqs9X-UzFezvnfHd5Db"

    @property
    def name(self):
        return "quickstart"

    @property
    def supported_splits(self):
        return None

    def _download_and_prepare(self, dataset_dir, scratch_dir, _):
        # Download dataset
        tmp_zip_path = os.path.join(scratch_dir, "quickstart.zip")
        logger.info("Downloading quickstart dataset to '%s'", tmp_zip_path)
        etaw.download_google_drive_file(self._GDRIVE_ID, path=tmp_zip_path)

        # Extract zip
        logger.info("Extracting dataset to '%s'", dataset_dir)
        etau.extract_zip(tmp_zip_path, outdir=dataset_dir, delete_zip=True)
        # @todo fix nested dir issue...

        # Get classes, if possible
        logger.info("Parsing dataset metadata")
        metadata_path = os.path.join(dataset_dir, "metadata.json")
        if os.path.isfile(metadata_path):
            metadata = etas.load_json(metadata_path)
            classes = metadata.get("info", {}).get("classes", None)
        else:
            classes = None

        # Compute number of samples
        data_dir = os.path.join(dataset_dir, "data")
        num_samples = len(etau.list_files(data_dir))
        logger.info("Found %d samples", num_samples)

        dataset_type = fot.FiftyOneDataset()
        return dataset_type, num_samples, classes


AVAILABLE_DATASETS = {
    "quickstart": QuickstartDataset,
}
